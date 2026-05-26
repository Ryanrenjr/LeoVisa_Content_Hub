param(
  [switch]$SkipBuild,
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

$env:AUTH_TRUST_HOST = "true"
$env:PORT = "$Port"

New-Item -ItemType Directory -Force -Path (Join-Path $Root "storage\topics") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $Root "backups") | Out-Null

npx prisma generate
npx prisma migrate deploy
npx prisma db seed

if (-not $SkipBuild) {
  npm run build
}

Write-Host ""
Write-Host "LeoVisa Content Hub is starting locally:"
Write-Host "  http://localhost:$Port"
Write-Host ""
Write-Host "Keep this window open while colleagues are using the system."
Write-Host ""

npm start -- -H 0.0.0.0 -p $Port
