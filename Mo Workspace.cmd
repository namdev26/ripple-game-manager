@echo off
setlocal
cd /d "%~dp0"
node server/main.mjs --open
if errorlevel 1 pause
