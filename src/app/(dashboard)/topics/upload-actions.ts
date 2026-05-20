'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { storage, buildRelPath, type FileSlot } from '@/lib/storage'
import { inferAssetStatus } from '@/lib/asset-status'

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function getTopicFolder(topicId: string) {
  const topic = await db.topic.findUniqueOrThrow({
    where: { id: topicId },
    select: { code: true, title: true },
  })
  return topic
}

function slotToPathField(slot: FileSlot) {
  return slot === 'textFile'   ? 'textFilePath'
       : slot === 'coverFile'  ? 'coverImagePath'
       : slot === 'videoFile'  ? 'videoFilePath'
       : 'scriptFilePath'
}

// ─── Delete a file ─────────────────────────────────────────────────────────────

export async function deleteAssetFile(
  topicId: string,
  assetType: string,
  fileSlot: FileSlot,
) {
  const asset = await db.asset.findFirstOrThrow({ where: { topicId, type: assetType } })
  const pathField = slotToPathField(fileSlot)
  const currentPath = asset[pathField]
  if (!currentPath) return

  await storage.delete(currentPath)

  const names: Record<string, string> = asset.originalNames ? JSON.parse(asset.originalNames) : {}
  const sizes: Record<string, number> = asset.fileSizes     ? JSON.parse(asset.fileSizes)     : {}
  delete names[fileSlot]
  delete sizes[fileSlot]

  const updatedFields = {
    textFilePath:   asset.textFilePath,
    coverImagePath: asset.coverImagePath,
    videoFilePath:  asset.videoFilePath,
    scriptFilePath: asset.scriptFilePath,
    [pathField]:    null,
  }
  const newStatus = inferAssetStatus({ type: assetType, ...updatedFields })

  await db.asset.update({
    where: { id: asset.id },
    data: {
      [pathField]: null,
      originalNames: JSON.stringify(names),
      fileSizes: JSON.stringify(sizes),
      status: newStatus,
    },
  })

  revalidatePath(`/topics/${topicId}`)
}

// ─── Save text content (online editor) ────────────────────────────────────────

export async function updateAssetText(
  topicId: string,
  assetType: string,
  fileSlot: FileSlot,
  content: string,
) {
  const topic = await getTopicFolder(topicId)
  const asset = await db.asset.findFirstOrThrow({ where: { topicId, type: assetType } })
  const pathField = slotToPathField(fileSlot)

  // Use existing path or create a new one
  const existingPath = asset[pathField] as string | null
  const relPath = existingPath ?? buildRelPath(topic.code, topic.title, fileSlot === 'textFile' ? (assetType === 'WECHAT_ARTICLE' ? 'wechat-article' : 'xhs-post') : 'video-script', '.txt')

  await storage.writeText(relPath, content)

  const names: Record<string, string> = asset.originalNames ? JSON.parse(asset.originalNames) : {}
  const sizes: Record<string, number> = asset.fileSizes     ? JSON.parse(asset.fileSizes)     : {}
  names[fileSlot] = names[fileSlot] ?? `${fileSlot}.txt`
  sizes[fileSlot] = Buffer.byteLength(content, 'utf-8')

  const updatedFields = {
    textFilePath:   asset.textFilePath,
    coverImagePath: asset.coverImagePath,
    videoFilePath:  asset.videoFilePath,
    scriptFilePath: asset.scriptFilePath,
    [pathField]:    relPath,
  }
  const newStatus = inferAssetStatus({ type: assetType, ...updatedFields })

  await db.asset.update({
    where: { id: asset.id },
    data: {
      [pathField]: relPath,
      originalNames: JSON.stringify(names),
      fileSizes: JSON.stringify(sizes),
      status: newStatus,
    },
  })

  revalidatePath(`/topics/${topicId}`)
  return { path: relPath, size: sizes[fileSlot] }
}

// ─── Read text content ─────────────────────────────────────────────────────────

export async function getAssetTextContent(
  topicId: string,
  assetType: string,
  fileSlot: FileSlot,
): Promise<string> {
  const asset = await db.asset.findFirstOrThrow({ where: { topicId, type: assetType } })
  const pathField = slotToPathField(fileSlot)
  const filePath = asset[pathField] as string | null
  if (!filePath) return ''
  const exists = await storage.exists(filePath)
  if (!exists) return ''
  return storage.readText(filePath)
}

// ─── Rename topic storage folder (called from updateTopic) ────────────────────

export async function renameTopicStorageFolder(
  oldCode: string, oldTitle: string,
  newCode: string, newTitle: string,
) {
  const { sanitizeForPath } = await import('@/lib/storage')
  const oldFolder = sanitizeForPath(`${oldCode}_${oldTitle}`)
  const newFolder = sanitizeForPath(`${newCode}_${newTitle}`)
  if (oldFolder !== newFolder) {
    await storage.renameTopicFolder(oldFolder, newFolder)
    // Update all asset paths in DB
    const assets = await db.asset.findMany({ where: { topic: { code: newCode } } })
    for (const asset of assets) {
      const updates: Record<string, string | null> = {}
      const fields = ['textFilePath', 'coverImagePath', 'videoFilePath', 'scriptFilePath'] as const
      for (const f of fields) {
        const p = asset[f]
        if (p && p.includes(`topics/${oldFolder}/`)) {
          updates[f] = p.replace(`topics/${oldFolder}/`, `topics/${newFolder}/`)
        }
      }
      if (Object.keys(updates).length > 0) {
        await db.asset.update({ where: { id: asset.id }, data: updates })
      }
    }
  }
}
