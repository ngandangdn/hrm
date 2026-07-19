@echo off
cd /d "%~dp0"
npm.cmd run dev -- --host 127.0.0.1 --port 5173 > "%~dp0frontend-demo.log" 2> "%~dp0frontend-demo.err.log"
