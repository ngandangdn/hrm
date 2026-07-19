$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$FrontendRoot = Join-Path $ProjectRoot "Frontend"

Set-Location -LiteralPath $FrontendRoot
npm run dev -- --host 127.0.0.1 --port 5173
