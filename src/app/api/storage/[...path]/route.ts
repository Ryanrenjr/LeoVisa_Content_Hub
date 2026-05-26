import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { storage } from '@/lib/storage'

// TODO: Add auth check when NextAuth is wired up
export const runtime = 'nodejs'

const MIME: Record<string, string> = {
  '.txt':  'text/plain; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4':  'video/mp4',
  '.mov':  'video/quicktime',
  '.avi':  'video/x-msvideo',
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params
  const relPath = segments.join('/')
  const absPath = storage.getAbsPath(relPath)

  // Prevent path traversal
  if (!absPath.startsWith(storage.root)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!fs.existsSync(absPath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const ext = path.extname(absPath).toLowerCase()
  const contentType = MIME[ext] ?? 'application/octet-stream'
  const stat = fs.statSync(absPath)

  // Range support for video streaming
  const range = req.headers.get('range')
  if (range && contentType.startsWith('video/')) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-')
    const start = parseInt(startStr, 10)
    const end = endStr ? parseInt(endStr, 10) : stat.size - 1
    const chunkSize = end - start + 1

    const stream = fs.createReadStream(absPath, { start, end })
    return new NextResponse(stream as unknown as ReadableStream, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunkSize),
        'Content-Type': contentType,
      },
    })
  }

  const buffer = fs.readFileSync(absPath)
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(stat.size),
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
