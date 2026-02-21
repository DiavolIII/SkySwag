@echo off
chcp 65001 >nul
title SKYSWAG LAUNCHER
color 0A

cls
echo.
echo ========================================
echo         SKYSWAG 3D LAUNCHER
echo ========================================
echo.

:: Переходим в корневую папку
cd /d D:\SkySwag

:: Проверяем Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found!
    echo Please install Python from python.org
    pause
    exit
)

echo [1/3] Python OK
echo.

:: Проверяем модели
echo [2/3] Checking 3D models...
set count=0
if exist "frontend\assets\models\*.glb" (
    for %%f in ("frontend\assets\models\*.glb") do set /a count+=1
    echo Found %count% models
) else (
    echo No models found!
    mkdir frontend\assets\models 2>nul
)
echo.

:: Запускаем сервер
echo [3/3] Starting server on port 8000...
echo.

:: Убиваем старые процессы Python
taskkill /f /im python.exe >nul 2>&1
timeout /t 2 /nobreak >nul

:: Запускаем новый сервер
start cmd /k "cd /d D:\SkySwag && python server.py"

:: Ждем запуск
timeout /t 3 /nobreak >nul

:: Открываем браузер
start http://localhost:8000/catalog.html

echo.
echo ========================================
echo         SERVER STARTED!
echo ========================================
echo.
echo URL: http://localhost:8000/catalog.html
echo Models: %count%
echo.
echo Press any key to close this window...
pause >nul  