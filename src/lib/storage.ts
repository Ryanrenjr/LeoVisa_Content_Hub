import fs from 'fs/promises'
import path from 'path'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface UploadResult {
  path: string       // relative path stored in DB
  size: number
  originalName: string
}

export interface StorageProvider {
  upload(buffer: Buffer, relPath: string): Promise<UploadResult>
  delete(relPath: string): Promise<void>
  exists(relPath: string): Promise<boolean>
  renameTopicFolder(oldFolder: string, newFolder: string): Promise<void>
  getAbsPath(relPath: string): string
  readText(relPath: string): Promise<string>
  writeText(relPath: string, content: string): Promise<void>
}

// ─── LocalStorageProvider ──────────────────────────────────────────────────────

export class LocalStorageProvider implements StorageProvider {
  readonly root: string

  constructor() {
    this.root = process.env.STORAGE_PATH ?? path.join(process.cwd(), 'storage')
  }

  getAbsPath(relPath: string): string {
    return path.join(this.root, relPath)
  }

  async upload(buffer: Buffer, relPath: string): Promise<UploadResult> {
    const absPath = this.getAbsPath(relPath)
    await fs.mkdir(path.dirname(absPath), { recursive: true })
    await fs.writeFile(absPath, buffer)
    return {
      path: relPath,
      size: buffer.byteLength,
      originalName: path.basename(relPath),
    }
  }

  async delete(relPath: string): Promise<void> {
    const absPath = this.getAbsPath(relPath)
    try {
      await fs.unlink(absPath)
      // Remove empty parent directory
      const dir = path.dirname(absPath)
      const files = await fs.readdir(dir)
      if (files.length === 0) await fs.rmdir(dir)
    } catch {
      // File already gone — ignore
    }
  }

  async exists(relPath: string): Promise<boolean> {
    try {
      await fs.access(this.getAbsPath(relPath))
      return true
    } catch {
      return false
    }
  }

  async renameTopicFolder(oldFolder: string, newFolder: string): Promise<void> {
    const oldAbs = path.join(this.root, 'topics', oldFolder)
    const newAbs = path.join(this.root, 'topics', newFolder)
    try {
      await fs.access(oldAbs)
      await fs.rename(oldAbs, newAbs)
    } catch {
      // Old folder doesn't exist — nothing to rename
    }
  }

  async readText(relPath: string): Promise<string> {
    return fs.readFile(this.getAbsPath(relPath), 'utf-8')
  }

  async writeText(relPath: string, content: string): Promise<void> {
    const absPath = this.getAbsPath(relPath)
    await fs.mkdir(path.dirname(absPath), { recursive: true })
    await fs.writeFile(absPath, content, 'utf-8')
  }
}

// ─── Singleton ─────────────────────────────────────────────────────────────────

export const storage = new LocalStorageProvider()

// ─── Path helpers ──────────────────────────────────────────────────────────────

/** Sanitize for filesystem: strip chars illegal on Windows/macOS */
export function sanitizeForPath(s: string): string {
  return s.replace(/[/\\:*?"<>|]/g, '_').trim()
}

/** topics/{code}_{title}/{slot}.{ext} */
export function buildRelPath(
  code: string,
  title: string,
  slotName: string,
  ext: string,
): string {
  const folder = sanitizeForPath(`${code}_${title}`)
  const fileName = ext.startsWith('.') ? `${slotName}${ext}` : `${slotName}.${ext}`
  return `topics/${folder}/${fileName}`
}

/** Folder name for a topic */
export function topicFolder(code: string, title: string): string {
  return sanitizeForPath(`${code}_${title}`)
}

// ─── File slot config ──────────────────────────────────────────────────────────

export type FileSlot = 'textFile' | 'coverFile' | 'videoFile' | 'scriptFile'

export const SLOT_CONFIG: Record<
  string,
  Record<
    FileSlot,
    { slotName: string; maxBytes: number; accept: string[] } | undefined
  >
> = {
  WECHAT_ARTICLE: {
    textFile:   { slotName: 'wechat-article', maxBytes: Infinity, accept: ['text/plain'] },
    coverFile:  { slotName: 'wechat-cover',   maxBytes: 10 * 1024 * 1024, accept: ['image/png', 'image/jpeg', 'image/webp'] },
    videoFile:  undefined,
    scriptFile: undefined,
  },
  XHS_POST: {
    textFile:   { slotName: 'xhs-post',   maxBytes: Infinity, accept: ['text/plain'] },
    coverFile:  { slotName: 'xhs-cover',  maxBytes: 10 * 1024 * 1024, accept: ['image/png', 'image/jpeg', 'image/webp'] },
    videoFile:  undefined,
    scriptFile: undefined,
  },
  VIDEO: {
    textFile:   undefined,
    coverFile:  { slotName: 'video-cover',   maxBytes: 10 * 1024 * 1024, accept: ['image/png', 'image/jpeg', 'image/webp'] },
    videoFile:  { slotName: 'video',         maxBytes: 500 * 1024 * 1024, accept: ['video/mp4', 'video/quicktime', 'video/x-msvideo'] },
    scriptFile: { slotName: 'video-script',  maxBytes: Infinity, accept: ['text/plain'] },
  },
}

// ─── OSSStorageProvider (future) ───────────────────────────────────────────────
// TODO: implement OSSStorageProvider for Alibaba Cloud OSS / AWS S3 when going cloud.
// interface: same StorageProvider contract, swap singleton above.
