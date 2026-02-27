@echo off
REM Dead Code Cleanup Script for Windows
REM Created: 2026-02-27
REM Purpose: Move unused files to backup directory

echo Starting dead code cleanup...
echo.

REM Create backup directory with timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set BACKUP_DIR=backup_%mydate%

mkdir "%BACKUP_DIR%"
echo Backup directory created: %BACKUP_DIR%
echo.

REM ============================================
REM 1. UNUSED JAVASCRIPT FILES
REM ============================================
echo Moving unused JavaScript files...

call :move_file "assets\js\custom.js"
call :move_file "assets\js\custom-shuffle-init.js"
call :move_file "assets\js\vendor.js"
call :move_file "assets\js\jquery.shuffle.min.js"
call :move_file "assets\js\imagesloaded.pkgd.js"
call :move_file "assets\js\parallax.min.js"
call :move_file "assets\js\photoswipe.min.js"
call :move_file "assets\js\photoswipe-ui-default.min.js"
call :move_file "assets\js\pswp.js"
call :move_file "assets\js\textition.min.js"
call :move_file "assets\js\contact.js"

REM ============================================
REM 2. UNUSED CSS FILES
REM ============================================
echo.
echo Moving unused CSS files...

call :move_file "assets\css\custom.css"
call :move_file "assets\css\vendor.css"
call :move_file "assets\css\LineIcons.min.css"
call :move_file "assets\css\photoswipe.min.css"
call :move_file "assets\css\default-skin.min.css"
call :move_file "assets\css\settings.css"
call :move_file "assets\css\theme-blue.css"
call :move_file "assets\css\theme-darkblue.css"
call :move_file "assets\css\theme-green.css"
call :move_file "assets\css\theme-grey.css"
call :move_file "assets\css\theme-pink.css"
call :move_file "assets\css\theme-purple.css"
call :move_file "assets\css\theme-red.css"
call :move_file "assets\css\theme-yellow.css"

REM ============================================
REM 3. UNUSED VIDEOS
REM ============================================
echo.
echo Moving unused video files...

call :move_file "assets\vd2.mp4"

REM ============================================
REM 4. UNUSED IMAGES
REM ============================================
echo.
echo Moving unused image files...

call :move_file "assets\thumbnail_1.png"
call :move_file "assets\thumbnail_2.png"
call :move_file "assets\images\avatar-1.png"
call :move_file "assets\images\avatar-2.png"
call :move_file "assets\images\avatar-3.png"
call :move_file "assets\images\avatar-4.png"
call :move_file "assets\images\chevron-left.svg"
call :move_file "assets\images\chevron-right.svg"
call :move_file "assets\images\curve.png"
call :move_file "assets\images\icon-quote.svg"
call :move_file "assets\images\my-avatar.png"
call :move_file "assets\images\pattern1.png"
call :move_file "assets\images\pic-1.png"
call :move_file "assets\images\pic-2.png"
call :move_file "assets\images\pic-3.png"
call :move_file "assets\images\item1.png"
call :move_file "assets\images\item1.svg"
call :move_file "assets\images\item2.png"
call :move_file "assets\images\item2.svg"
call :move_file "assets\images\item3.png"
call :move_file "assets\images\item3.svg"
call :move_file "assets\images\item4.png"
call :move_file "assets\images\item4.svg"
call :move_file "assets\images\item5.png"
call :move_file "assets\images\item5.svg"
call :move_file "assets\images\item6.png"
call :move_file "assets\images\item6.svg"
call :move_file "assets\images\item7.png"
call :move_file "assets\images\item7.svg"
call :move_file "assets\images\item8.png"
call :move_file "assets\images\item8.svg"
call :move_file "assets\images\AppStore-Icons.svg"

REM ============================================
REM 5. UNUSED FONTS
REM ============================================
echo.
echo Moving unused font files...

call :move_file "assets\fonts\LineIcons.ttf"

REM ============================================
REM 6. UNUSED CSS ASSETS
REM ============================================
echo.
echo Moving unused CSS assets...

call :move_file "assets\css\default-skin.png"

REM ============================================
REM SUMMARY
REM ============================================
echo.
echo ========================================
echo Cleanup completed!
echo ========================================
echo.
echo Backup location: %BACKUP_DIR%
echo.
echo IMPORTANT:
echo   1. Test your website thoroughly
echo   2. If everything works, you can delete: %BACKUP_DIR%
echo   3. If issues occur, restore files from: %BACKUP_DIR%
echo.
echo To restore all files, copy them back from %BACKUP_DIR%
echo.
pause
goto :eof

REM ============================================
REM FUNCTION: Move file to backup
REM ============================================
:move_file
set "file=%~1"
if exist "%file%" (
    for %%F in ("%file%") do set "dir=%%~dpF"
    if not exist "%BACKUP_DIR%\%dir%" mkdir "%BACKUP_DIR%\%dir%"
    move "%file%" "%BACKUP_DIR%\%file%" >nul 2>&1
    echo   [OK] Moved: %file%
) else (
    echo   [SKIP] Not found: %file%
)
goto :eof
