import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    commit: process.env.RAILWAY_GIT_COMMIT_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    branch: process.env.RAILWAY_GIT_BRANCH ?? process.env.VERCEL_GIT_COMMIT_REF ?? null,
    deployment: process.env.RAILWAY_DEPLOYMENT_ID ?? null,
    environment: process.env.RAILWAY_ENVIRONMENT_NAME ?? process.env.NODE_ENV ?? null,
    nodeEnv: process.env.NODE_ENV ?? null,
  })
}
