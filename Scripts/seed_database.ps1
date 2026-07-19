$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Python = Join-Path $ProjectRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $Python)) {
    $Python = "python"
}

$env:DB_URL = "sqlite:///" + ((Join-Path $ProjectRoot "Database\demo_hicas.db") -replace "\\", "/")
$env:ENVIRONMENT = "seed"

& $Python (Join-Path $ProjectRoot "Database\seed\seed_data.py")
