@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
  py serve-local.py
) else (
  where python >nul 2>nul
  if %errorlevel%==0 (
    python serve-local.py
  ) else (
    echo ERROR: Python was not found.
    echo Install Python or add it to PATH, then run this file again.
    pause
  )
)
