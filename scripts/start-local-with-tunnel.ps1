param(
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-File", "`"$Root\scripts\start-local-server.ps1`"",
  "-Port", "$Port"
) -WorkingDirectory $Root

Start-Sleep -Seconds 8

Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-File", "`"$Root\scripts\start-cloudflare-tunnel.ps1`"",
  "-Port", "$Port"
) -WorkingDirectory $Root

Write-Host "Opened two windows: local server and Cloudflare Tunnel."
