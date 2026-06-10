@echo off
setlocal

cd /d "%~dp0"
set "PORT=8090"
set "URL=http://localhost:%PORT%"

echo Starting Neighborhood Defense local server...
echo Project: %CD%
echo URL: %URL%
echo.

py -3 --version >nul 2>nul
if %ERRORLEVEL%==0 (
    start "" "%URL%"
    py -3 -m http.server %PORT%
    goto :end
)

python --version >nul 2>nul
if %ERRORLEVEL%==0 (
    start "" "%URL%"
    python -m http.server %PORT%
    goto :end
)

echo Python not found.
echo Please install Python, then run this file again.
echo Download: https://www.python.org/downloads/
pause

:end
endlocal
