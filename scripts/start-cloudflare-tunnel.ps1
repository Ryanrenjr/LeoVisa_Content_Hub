param(
  [int]$Port = 3001
)

$ErrorActionPreference = "Stop"

$CloudflaredCommand = Get-Command cloudflared -ErrorAction SilentlyContinue
$Cloudflared = if ($CloudflaredCommand) { $CloudflaredCommand.Source } else { $null }
if (-not $Cloudflared) {
  $KnownPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
  if (Test-Path -LiteralPath $KnownPath) {
    $Cloudflared = $KnownPath
  }
}

if (-not $Cloudflared) {
  throw "cloudflared is not installed. Install it with: winget install --id Cloudflare.cloudflared"
}

Write-Host ""
Write-Host "Starting Cloudflare Quick Tunnel for:"
Write-Host "  http://localhost:$Port"
Write-Host ""
Write-Host "Copy the https://*.trycloudflare.com URL and share it with colleagues."
Write-Host "Keep this window open while colleagues are using the system."
Write-Host ""

& $Cloudflared tunnel --url "http://localhost:$Port"
