@echo off
cd /d "%~dp0"
set "DB_URL=sqlite:///./demo_hicas.db"
set "ENVIRONMENT=seed"
".venv\Scripts\python.exe" tools\run_demo_backend.py > "%~dp0backend-demo.log" 2> "%~dp0backend-demo.err.log"
