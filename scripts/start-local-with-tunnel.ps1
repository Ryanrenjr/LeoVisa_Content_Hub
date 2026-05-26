param(
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$LogDir = Join-Path $Root "logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

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

$OutLog = Join-Path $LogDir "cloudflared.out.log"
$ErrLog = Join-Path $LogDir "cloudflared.err.log"
Remove-Item -LiteralPath $OutLog, $ErrLog -Force -ErrorAction SilentlyContinue

Start-Process -FilePath $Cloudflared -ArgumentList @(
  "tunnel",
  "--url",
  "http://127.0.0.1:$Port"
) -WorkingDirectory $Root -RedirectStandardOutput $OutLog -RedirectStandardError $ErrLog -WindowStyle Hidden

$PublicUrl = $null
for ($i = 0; $i -lt 40; $i++) {
  Start-Sleep -Seconds 1
  $Combined = ""
  if (Test-Path -LiteralPath $OutLog) { $Combined += Get-Content -Raw $OutLog }
  if (Test-Path -LiteralPath $ErrLog) { $Combined += Get-Content -Raw $ErrLog }
  $Match = [regex]::Match($Combined, "https://[a-z0-9-]+\.trycloudflare\.com")
  if ($Match.Success) {
    $PublicUrl = $Match.Value
    break
  }
}

if (-not $PublicUrl) {
  throw "Could not get a Cloudflare Tunnel URL. Check logs in $LogDir."
}

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-File", "`"$Root\scripts\start-local-server.ps1`"",
  "-Port", "$Port",
  "-PublicUrl", "`"$PublicUrl`""
) -WorkingDirectory $Root

Write-Host "LeoVisa public URL:"
Write-Host "  $PublicUrl"
Write-Host ""
Write-Host "Cloudflare Tunnel is running in the background. Local server opened in a PowerShell window."
