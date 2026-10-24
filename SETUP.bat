@echo off
chcp 65001 >nul
title MindfulBarrier - Setup & Master Control Hub
setlocal EnableDelayedExpansion

:: Self-elevate to Administrator if needed
net session >nul 2>&1
if %errorLevel% neq 0 (
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

set "REPO_DIR=%~dp0"
:: Remove trailing backslash
if "%REPO_DIR:~-1%"=="\" set "REPO_DIR=%REPO_DIR:~0,-1%"

:menu
cls
echo ===================================================================
echo             MindfulBarrier — Master Control Hub 🛑
echo ===================================================================
echo.
echo   [1] Install & Lock MindfulBarrier in Chrome (1-Click Setup)
echo   [2] Start 20-Minute Cooldown Timer to Temporarily Unlock
echo   [3] Restore Desktop Shortcut Icons
echo   [4] Clean Uninstall (Remove all Registry Policies)
echo   [5] Exit
echo.
echo ===================================================================
set /p choice="Enter choice [1-5]: "

if "%choice%"=="1" goto install_and_lock
if "%choice%"=="2" goto start_unlock
if "%choice%"=="3" goto restore_shortcuts
if "%choice%"=="4" goto clean_uninstall
if "%choice%"=="5" exit /b
goto menu

:install_and_lock
cls
echo ===================================================================
echo     MindfulBarrier — Setup & Lock Guide
echo ===================================================================
echo.
echo 1. Extension folder path copied to clipboard:
echo    "%REPO_DIR%"
echo.
echo 2. Opening chrome://extensions in Chrome...
echo.
echo 3. In Chrome:
echo    - Turn ON "Developer mode" (top right toggle).
echo    - Click "Load unpacked" (top left).
echo    - Press Ctrl+V into the path bar and select this folder.
echo.

:: Copy path to clipboard
<nul set /p="%REPO_DIR%" | clip

:: Default ID or ask
set "EXT_ID=dllgnjbbjpjngcmmbmbaiefllmheeee"
echo Current Default Extension ID: %EXT_ID%
set /p "USER_ID=If your Chrome Extension ID is different, paste it here (or press Enter to keep default): "
if not "!USER_ID!"=="" set "EXT_ID=!USER_ID!"

set "POLICY_VAL=!EXT_ID!;https://clients2.google.com/service/update2/crx"
reg add "HKLM\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist" /v "1" /t REG_SZ /d "!POLICY_VAL!" /f >nul 2>&1
reg add "HKCU\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist" /v "1" /t REG_SZ /d "!POLICY_VAL!" /f >nul 2>&1

:: Open chrome://extensions
start chrome.exe "chrome://extensions"

:: Create shortcuts
call :create_shortcuts_silent

echo.
echo [✓] Lock policy applied! Chrome will now protect MindfulBarrier from instant removal.
echo [✓] Desktop shortcuts created!
echo.
pause
goto menu

:start_unlock
cls
if exist "%REPO_DIR%\scripts\Unlock-MindfulBarrier-20Min.bat" (
    call "%REPO_DIR%\scripts\Unlock-MindfulBarrier-20Min.bat"
) else (
    echo Error: Unlock script not found in %REPO_DIR%\scripts
    pause
)
goto menu

:restore_shortcuts
cls
call :create_shortcuts_silent
echo.
echo [✓] Desktop shortcuts successfully restored!
echo.
pause
goto menu

:create_shortcuts_silent
powershell -Command "
$desktop = [Environment]::GetFolderPath('Desktop');
$wsh = New-Object -ComObject WScript.Shell;
$repo = '%REPO_DIR%'.Replace('\', '\\');
$sc1 = $wsh.CreateShortcut(\"$desktop\MindfulBarrier - Lock.lnk\");
$sc1.TargetPath = '%REPO_DIR%\scripts\Lock-MindfulBarrier-Extension.bat';
$sc1.WorkingDirectory = '%REPO_DIR%\scripts';
$sc1.IconLocation = '%REPO_DIR%\icons\icon128.png,0';
$sc1.Description = 'Lock MindfulBarrier Extension';
$sc1.Save();
$sc2 = $wsh.CreateShortcut(\"$desktop\MindfulBarrier - 20Min Unlock.lnk\");
$sc2.TargetPath = '%REPO_DIR%\scripts\Unlock-MindfulBarrier-20Min.bat';
$sc2.WorkingDirectory = '%REPO_DIR%\scripts';
$sc2.IconLocation = '%REPO_DIR%\icons\icon128.png,0';
$sc2.Description = 'MindfulBarrier 20-Minute Delayed Unlock';
$sc2.Save();
" >nul 2>&1
goto :eof

:clean_uninstall
cls
echo ===================================================================
echo     MindfulBarrier — Remove Registry Lock
echo ===================================================================
echo.
reg delete "HKLM\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist" /v "1" /f >nul 2>&1
reg delete "HKCU\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist" /v "1" /f >nul 2>&1
echo [✓] Registry policies successfully cleared.
echo.
pause
goto menu
