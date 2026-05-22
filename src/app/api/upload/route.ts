import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { storage, buildRelPath, SLOT_CONFIG, type FileSlot } from '@/lib/storage'
import { inferAssetStatus } from '@/lib/asset-status'

export const maxDuration = 300 // allow 5 min for large video uploads

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const topicId  = formData.get('topicId')  as string | null
    const assetType = formData.get('assetType') as string | null
    const fileSlot = formData.get('fileSlot')  as FileSlot | null
    const file     = formData.get('file')      as File | null

    if (!topicId || !assetType || !fileSlot || !file) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Validate slot exists for this assetType
    const slotCfg = SLOT_CONFIG[assetType]?.[fileSlot]
    if (!slotCfg) {
      return NextResponse.json({ error: `Invalid slot ${fileSlot} for ${assetType}` }, { status: 400 })
    }

    // Size check (server-side)
    if (slotCfg.maxBytes !== Infinity && file.size > slotCfg.maxBytes) {
      return NextResponse.json(
        { error: `File too large. Max: ${Math.round(slotCfg.maxBytes / 1024 / 1024)}MB` },
        { status: 413 },
      )
    }

    // Look up topic for folder naming
    const topic = await db.topic.findUnique({
      where: { id: topicId },
      select: { code: true, title: true },
    })
    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 })

    // Determine file extension from original filename
    const ext = path.extname(file.name) || (file.type.startsWith('text/') ? '.txt' : '')
    const relPath = buildRelPath(topic.code, topic.title, slotCfg.slotName, ext)

    // Write to disk
    const buffer = Buffer.from(await file.arrayBuffer())
    await storage.upload(buffer, relPath)

    // Build DB field update
    const pathField = fileSlot === 'textFile'   ? 'textFilePath'
                    : fileSlot === 'coverFile'  ? 'coverImagePath'
                    : fileSlot === 'videoFile'  ? 'videoFilePath'
                    : 'scriptFilePath'

    // Update originalNames + fileSizes JSON
    const asset = await db.asset.findFirst({ where: { topicId, type: assetType } })
    if (!asset) return NextResponse.json({ error: 'Asset record not found' }, { status: 404 })

    const names: Record<string, string> = asset.originalNames
      ? JSON.parse(asset.originalNames)
      : {}
    const sizes: Record<string, number> = asset.fileSizes
      ? JSON.parse(asset.fileSizes)
      : {}
    names[fileSlot] = file.name
    sizes[fileSlot] = file.size

    // Compute new status after update
    const updatedFields = {
      textFilePath:   asset.textFilePath,
      coverImagePath: asset.coverImagePath,
      videoFilePath:  asset.videoFilePath,
      scriptFilePath: asset.scriptFilePath,
      [pathField]:    relPath,
    }
    const newStatus = inferAssetStatus({ type: assetType, ...updatedFields })

    const updated = await db.asset.update({
      where: { id: asset.id },
      data: {
        [pathField]: relPath,
        originalNames: JSON.stringify(names),
        fileSizes: JSON.stringify(sizes),
        status: newStatus,
      },
    })

    return NextResponse.json({ success: true, asset: updated, path: relPath })
  } catch (err) {
    console.error('[upload]', err)
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg || 'Upload failed' }, { status: 500 })
  }
}
