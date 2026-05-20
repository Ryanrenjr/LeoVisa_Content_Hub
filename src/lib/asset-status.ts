import type { Asset } from '@prisma/client'
import type { AssetStatus, AssetType } from '@/types'

function maxFileCount(type: AssetType): number {
  return type === 'VIDEO' ? 3 : 2
}

function countFiles(asset: Pick<Asset, 'type' | 'textFilePath' | 'coverImagePath' | 'videoFilePath' | 'scriptFilePath'>): number {
  let n = 0
  if (asset.type !== 'VIDEO' && asset.textFilePath) n++
  if (asset.type === 'VIDEO' && asset.scriptFilePath) n++
  if (asset.coverImagePath) n++
  if (asset.type === 'VIDEO' && asset.videoFilePath) n++
  return n
}

export function inferAssetStatus(
  asset: Pick<Asset, 'type' | 'textFilePath' | 'coverImagePath' | 'videoFilePath' | 'scriptFilePath'>,
): AssetStatus {
  const count = countFiles(asset)
  if (count === 0) return 'NOT_STARTED'
  if (count >= maxFileCount(asset.type as AssetType)) return 'COMPLETED'
  return 'IN_PROGRESS'
}
