import fs from 'fs/promises'
import path from 'path'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function redactDatabaseUrl(value: string | undefined) {
  if (!value) return null
  return value.replace(/:\/\/.*@/, '://***@')
}

async function pathStatus(target: string) {
  try {
    const stat = await fs.stat(target)
    return {
      exists: true,
      isDirectory: stat.isDirectory(),
      isFile: stat.isFile(),
      size: stat.isFile() ? stat.size : undefined,
    }
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function canWriteDirectory(target: string) {
  const probe = path.join(target, `.health-${Date.now()}`)

  try {
    await fs.mkdir(target, { recursive: true })
    await fs.writeFile(probe, 'ok')
    await fs.unlink(probe)
    return true
  } catch {
    return false
  }
}

export async function GET() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  const secret = process.env.AUTH_SECRET
  const suppliedSecret = (await headers()).get('x-db-health-token')
  const hasDiagnosticToken = Boolean(secret && suppliedSecret && suppliedSecret === secret)

  if (!hasDiagnosticToken && (!session?.user || role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const databaseUrl = process.env.DATABASE_URL
  const storagePath = process.env.STORAGE_PATH ?? path.join(process.cwd(), 'storage')
  const dbFilePath = databaseUrl?.startsWith('file:') ? databaseUrl.replace(/^file:/, '') : null

  const [users, accounts, topics, assets, tags, publishTasks] = await Promise.all([
    db.user.count(),
    db.account.count(),
    db.topic.count(),
    db.asset.count(),
    db.tag.count(),
    db.publishTask.count(),
  ])

  return NextResponse.json({
    counts: {
      User: users,
      Account: accounts,
      Topic: topics,
      Asset: assets,
      Tag: tags,
      PublishTask: publishTasks,
    },
    env: {
      DATABASE_URL: redactDatabaseUrl(databaseUrl),
      STORAGE_PATH: storagePath,
    },
    paths: {
      data: await pathStatus('/data'),
      database: dbFilePath ? await pathStatus(dbFilePath) : null,
      storage: await pathStatus(storagePath),
      storageWritable: await canWriteDirectory(storagePath),
    },
  })
}
