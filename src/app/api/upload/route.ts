import { NextRequest, NextResponse } from 'next/server'
import Busboy from 'busboy'
import fs from 'fs/promises'
import { createWriteStream } from 'fs'
import path from 'path'
import { Readable, Transform } from 'stream'
import { pipeline } from 'stream/promises'
import type { ReadableStream as NodeReadableStream } from 'stream/web'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { storage, buildRelPath, SLOT_CONFIG, type FileSlot } from '@/lib/storage'
import { inferAssetStatus } from '@/lib/asset-status'

export const runtime = 'nodejs'
export const maxDuration = 300 // allow 5 min for large video uploads

class UploadError extends Error {
  constructor(
    message: string,
    readonly status = 500,
  ) {
    super(message)
  }
}

interface UploadedFileResult {
  topicId: string
  assetType: string
  fileSlot: FileSlot
  fileName: string
  fileSize: number
  relPath: string
}

function getUploadFields(fields: Record<string, string>) {
  const topicId = fields.topicId
  const assetType = fields.assetType
  const fileSlot = fields.fileSlot as FileSlot | undefined

  if (!topicId || !assetType || !fileSlot) {
    throw new UploadError('Missing fields', 400)
  }

  const slotCfg = SLOT_CONFIG[assetType]?.[fileSlot]
  if (!slotCfg) {
    throw new UploadError(`Invalid slot ${fileSlot} for ${assetType}`, 400)
  }

  return { topicId, assetType, fileSlot, slotCfg }
}

async function writeFileStream({
  fields,
  file,
  filename,
}: {
  fields: Record<string, string>
  file: NodeJS.ReadableStream
  filename: string
}): Promise<UploadedFileResult> {
  const { topicId, assetType, fileSlot, slotCfg } = getUploadFields(fields)

  const topic = await db.topic.findUnique({
    where: { id: topicId },
    select: { code: true, title: true },
  })
  if (!topic) throw new UploadError('Topic not found', 404)

  const ext = path.extname(filename) || '.bin'
  const relPath = buildRelPath(topic.code, topic.title, slotCfg.slotName, ext)
  const absPath = storage.getAbsPath(relPath)
  await fs.mkdir(path.dirname(absPath), { recursive: true })

  let fileSize = 0
  const sizeLimiter = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      fileSize += chunk.byteLength

      if (Number.isFinite(slotCfg.maxBytes) && fileSize > slotCfg.maxBytes) {
        callback(
          new UploadError(
            `File too large. Max: ${Math.round(slotCfg.maxBytes / 1024 / 1024)}MB`,
            413,
          ),
        )
        return
      }

      callback(null, chunk)
    },
  })

  try {
    await pipeline(file, sizeLimiter, createWriteStream(absPath))
  } catch (error) {
    await fs.rm(absPath, { force: true })
    throw error
  }

  return { topicId, assetType, fileSlot, fileName: filename, fileSize, relPath }
}

async function parseUpload(req: NextRequest): Promise<UploadedFileResult> {
  const body = req.body
  if (!body) throw new UploadError('Missing request body', 400)

  return new Promise((resolve, reject) => {
    const fields: Record<string, string> = {}
    const headers = Object.fromEntries(req.headers.entries())
    const busboy = Busboy({ headers })
    let uploadPromise: Promise<UploadedFileResult> | null = null
    let settled = false

    function fail(error: unknown) {
      if (settled) return
      settled = true
      reject(error)
    }

    busboy.on('field', (name, value) => {
      fields[name] = value
    })

    busboy.on('file', (name, file, info) => {
      if (name !== 'file' || uploadPromise) {
        file.resume()
        return
      }

      uploadPromise = writeFileStream({
        fields,
        file,
        filename: info.filename,
      }).catch((error) => {
        busboy.destroy(error)
        throw error
      })
    })

    busboy.on('error', fail)

    busboy.on('finish', async () => {
      if (settled) return
      settled = true

      try {
        if (!uploadPromise) throw new UploadError('Missing file', 400)
        resolve(await uploadPromise)
      } catch (error) {
        reject(error)
      }
    })

    Readable.fromWeb(body as unknown as NodeReadableStream<Uint8Array>).pipe(busboy)
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { topicId, assetType, fileSlot, fileName, fileSize, relPath } = await parseUpload(req)

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
    names[fileSlot] = fileName
    sizes[fileSlot] = fileSize

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
    const status = err instanceof UploadError ? err.status : 500
    return NextResponse.json({ error: msg || 'Upload failed' }, { status })
  }
}
