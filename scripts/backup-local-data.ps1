param(
  [string]$BackupRoot = "C:\LeoVisa_Backups"
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$Target = Join-Path $BackupRoot "leovisa-content-hub-$Stamp"

New-Item -ItemType Directory -Force -Path $Target | Out-Null

$DbPath = Join-Path $Root "prisma\dev.db"
if (Test-Path -LiteralPath $DbPath) {
  Copy-Item -LiteralPath $DbPath -Destination (Join-Path $Target "dev.db") -Force
}

$StoragePath = Join-Path $Root "storage"
if (Test-Path -LiteralPath $StoragePath) {
  robocopy $StoragePath (Join-Path $Target "storage") /E /R:1 /W:1 /NFL /NDL /NJH /NJS /NP
  $Code = $LASTEXITCODE
  if ($Code -gt 7) {
    throw "robocopy failed with exit code $Code"
  }
}

Write-Host "Backup created:"
Write-Host "  $Target"
