@echo off
chcp 65001 >nul
title SkySwag - Универсальный менеджер проекта
color 0A
setlocal enabledelayedexpansion

:: ========== ПЕРЕМЕННЫЕ ==========
set "PROJECT_ROOT=C:\SkySwag"
set "BACKEND_DIR=%PROJECT_ROOT%\backend"
set "FRONTEND_DIR=%PROJECT_ROOT%\frontend"
set "DB_FILE=%BACKEND_DIR%\instance\skywag.db"
set "BACKUP_DIR=%BACKEND_DIR%\instance\backups"
set "LOG_FILE=%BACKEND_DIR%\instance\project_operations.log"
set "ADMIN_PASSWORD=SkySwagAdmin2024!@#$"

:: ========== СОЗДАЕМ ПАПКИ ==========
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%" 2>nul
if not exist "%BACKEND_DIR%\instance" mkdir "%BACKEND_DIR%\instance" 2>nul

:: ========== ФУНКЦИЯ ПАУЗЫ ==========
:pause_and_return
echo.
echo ═══════════════════════════════════════════════════════════════════
echo Нажмите любую клавишу для возврата в главное меню...
pause >nul
goto menu

:: ========== ФУНКЦИЯ ПРОВЕРКИ PYTHON ==========
:check_python
python --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ⚠️  ВНИМАНИЕ! Python не найден!
    echo.
    echo    Установите Python с официального сайта:
    echo    https://www.python.org/downloads/
    echo.
    echo    ⚠️  ВАЖНО: При установке поставьте галочку "Add Python to PATH"
    echo.
    echo Нажмите любую клавишу для выхода...
    pause >nul
    exit /b 1
)
exit /b 0

:: ========== ФУНКЦИЯ ПРОВЕРКИ ЗАВИСИМОСТЕЙ ==========
:check_deps
cd /d "%BACKEND_DIR%" 2>nul
if errorlevel 1 (
    echo ❌ Ошибка: Папка backend не найдена по пути: %BACKEND_DIR%
    pause
    exit /b 1
)
python -c "import flask" 2>nul
if errorlevel 1 (
    echo.
    echo 📦 Установка зависимостей...
    echo.
    pip install flask flask-sqlalchemy flask-migrate flask-cors pyjwt bcrypt email-validator python-dotenv 2>nul
    if errorlevel 1 (
        echo ❌ Ошибка установки зависимостей!
        pause
        exit /b 1
    )
    echo ✅ Зависимости установлены
    call :log "Зависимости установлены"
)
exit /b 0

:: ========== ФУНКЦИЯ ПРОВЕРКИ АДМИН-ПАРОЛЯ ==========
:check_admin_password
echo.
set /p "admin_pass=🔐 Введите мастер-пароль для доступа: "
if "%admin_pass%"=="%ADMIN_PASSWORD%" (
    exit /b 0
) else (
    echo.
    echo ❌ Неверный пароль! Доступ запрещен.
    echo.
    pause
    exit /b 1
)

:: ========== ФУНКЦИЯ ЛОГИРОВАНИЯ ==========
:log
echo [%date% %time%] %* >> "%LOG_FILE%" 2>nul
goto :eof

:: ========== ОСНОВНОЕ МЕНЮ ==========
:menu
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
echo ║                                                                                                              ║
echo ║   ███████╗██╗  ██╗██╗   ██╗███████╗██╗    ██╗ █████╗  ██████╗     ██████╗  █████╗ ███████╗███████╗        ║
echo ║   ██╔════╝██║ ██╔╝╚██╗ ██╔╝██╔════╝██║    ██║██╔══██╗██╔════╝     ██╔══██╗██╔══██╗██╔════╝██╔════╝        ║
echo ║   ███████╗█████╔╝  ╚████╔╝ ███████╗██║ █╗ ██║███████║██║  ███╗    ██████╔╝███████║███████╗█████╗          ║
echo ║   ╚════██║██╔═██╗   ╚██╔╝  ╚════██║██║███╗██║██╔══██║██║   ██║    ██╔══██╗██╔══██║╚════██║██╔══╝          ║
echo ║   ███████║██║  ██╗   ██║   ███████║╚███╔███╔╝██║  ██║╚██████╔╝    ██████╔╝██║  ██║███████║███████╗        ║
echo ║   ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝ ╚═════╝     ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝        ║
echo ║                                                                                                              ║
echo ║                              УНИВЕРСАЛЬНЫЙ МЕНЕДЖЕР ПРОЕКТА SKYSWAG                                            ║
echo ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
echo.
echo   📁 Проект: %PROJECT_ROOT%
echo   🗄️  База данных: %DB_FILE%
echo   📋 Лог файл: %LOG_FILE%
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
echo ║  🚀 БЫСТРЫЙ ЗАПУСК                                                                                          ║
echo ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
echo ║  [1]  🚀 Запустить Flask сервер (порт 5000)                                                                  ║
echo ║  [2]  🌐 Запустить статический сервер (порт 8000, для 3D моделей)                                            ║
echo ║  [3]  🔄 Запустить оба сервера одновременно                                                                  ║
echo ║  [4]  🛑 Остановить все серверы                                                                              ║
echo ║  [5]  🔄 Перезапустить Flask сервер                                                                          ║
echo ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
echo ║  🔧 УСТАНОВКА И НАСТРОЙКА                                                                                    ║
echo ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
echo ║  [6]  📦 Проверить/установить все зависимости (pip install)                                                  ║
echo ║  [7]  🗄️  Создать/обновить базу данных (db.create_all)                                                      ║
echo ║  [8]  📦 Инициализировать Alembic (миграции)                                                                ║
echo ║  [9]  ⬆️  Применить миграции (upgrade)                                                                      ║
echo ║  [10] 📝 Создать новую миграцию                                                                              ║
echo ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
echo ║  👤 АККАУНТЫ (требуют пароль админ-панели)                                                                  ║
echo ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
echo ║  [11] 👑 Создать администратора (admin@skywag.ru / admin123)                                                 ║
echo ║  [12] 👥 Создать тестового пользователя (test@test.com / test123)                                           ║
echo ║  [13] 🚁 Добавить тестовые товары (3 вертолета)                                                              ║
echo ║  [14] 📦 Создать тестовый заказ                                                                              ║
echo ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
echo ║  🔍 SQLite УПРАВЛЕНИЕ                                                                                        ║
echo ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
echo ║  [15] 📋 Показать все таблицы                                                                                ║
echo ║  [16] 📊 Показать статистику (кол-во записей)                                                                ║
echo ║  [17] 📄 Показать содержимое таблицы                                                                         ║
echo ║  [18] ⚡ Выполнить SQL запрос                                                                                ║
echo ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
echo ║  💾 РЕЗЕРВНОЕ КОПИРОВАНИЕ                                                                                    ║
echo ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
echo ║  [19] 💾 Создать резервную копию БД                                                                          ║
echo ║  [20] 🔄 Восстановить из резервной копии                                                                     ║
echo ║  [21] 📁 Показать все резервные копии                                                                        ║
echo ║  [22] 🗑️  Удалить старые копии (старше 30 дней)                                                              ║
echo ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
echo ║  🧹 ОЧИСТКА И ОПТИМИЗАЦИЯ                                                                                    ║
echo ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
echo ║  [23] 🧹 Оптимизировать базу данных (VACUUM)                                                                 ║
echo ║  [24] 🔧 Проверить целостность БД                                                                            ║
echo ║  [25] 📊 Экспорт всей базы в SQL файл                                                                        ║
echo ║  [26] 📥 Импорт из SQL файла                                                                                 ║
echo ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
echo ║  📊 АНАЛИТИКА (требуют пароль админ-панели)                                                                 ║
echo ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
echo ║  [27] 📈 Показать популярные страницы                                                                        ║
echo ║  [28] 👥 Показать активность пользователей по дням                                                           ║
echo ║  [29] 📋 Показать последние просмотры страниц                                                                ║
echo ║  [30] 🖱️ Показать последние действия пользователей                                                           ║
echo ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
echo ║  ⚠️  ОПАСНЫЕ ОПЕРАЦИИ (ТРЕБУЮТ ПОДТВЕРЖДЕНИЯ И ПАРОЛЬ)                                                       ║
echo ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
echo ║  [31] 🧨 Очистить ВСЕ данные (пользователи, заказы, товары) - НЕОБРАТИМО!                                    ║
echo ║  [32] 🗑️  Полный сброс базы данных (удалить и пересоздать) - НЕОБРАТИМО!                                    ║
echo ║  [33] 🔄 Сбросить Alembic и пересоздать миграции (только при проблемах)                                      ║
echo ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
echo ║  📋 ИНФОРМАЦИЯ                                                                                               ║
echo ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
echo ║  [34] 📋 Показать последние операции из лога                                                                 ║
echo ║  [35] 🗑️  Очистить лог-файл                                                                                 ║
echo ║  [36] ℹ️  Информация о проекте                                                                               ║
echo ╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
echo ║  [0]  ❌ Выход                                                                                               ║
echo ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
echo.
set /p choice="👉 Введите номер действия (0-36): "

:: ========== ВАЛИДАЦИЯ ВВОДА ==========
if "%choice%"=="" goto menu
if %choice% lss 0 goto menu
if %choice% gtr 36 goto menu

:: ========== БЫСТРЫЙ ЗАПУСК ==========
if "%choice%"=="1" goto start_flask
if "%choice%"=="2" goto start_static
if "%choice%"=="3" goto start_both
if "%choice%"=="4" goto stop_servers
if "%choice%"=="5" goto restart_flask

:: ========== УСТАНОВКА ==========
if "%choice%"=="6" goto install_deps
if "%choice%"=="7" goto create_db
if "%choice%"=="8" goto init_alembic
if "%choice%"=="9" goto upgrade_db
if "%choice%"=="10" goto create_migration

:: ========== АККАУНТЫ ==========
if "%choice%"=="11" goto create_admin_with_password
if "%choice%"=="12" goto create_test_user
if "%choice%"=="13" goto create_test_products
if "%choice%"=="14" goto create_test_order

:: ========== SQLite ==========
if "%choice%"=="15" goto show_tables
if "%choice%"=="16" goto table_stats
if "%choice%"=="17" goto show_table_content
if "%choice%"=="18" goto sql_query

:: ========== РЕЗЕРВНОЕ КОПИРОВАНИЕ ==========
if "%choice%"=="19" goto backup_db
if "%choice%"=="20" goto restore_db
if "%choice%"=="21" goto show_backups
if "%choice%"=="22" goto clean_old_backups

:: ========== ОЧИСТКА ==========
if "%choice%"=="23" goto vacuum_db
if "%choice%"=="24" goto integrity_check
if "%choice%"=="25" goto export_sql
if "%choice%"=="26" goto import_sql

:: ========== АНАЛИТИКА ==========
if "%choice%"=="27" goto analytics_popular_pages
if "%choice%"=="28" goto analytics_user_activity
if "%choice%"=="29" goto analytics_page_views
if "%choice%"=="30" goto analytics_user_actions

:: ========== ОПАСНЫЕ ==========
if "%choice%"=="31" goto clear_all_data_with_password
if "%choice%"=="32" goto drop_and_recreate_with_password
if "%choice%"=="33" goto reset_alembic_force_with_password

:: ========== ИНФОРМАЦИЯ ==========
if "%choice%"=="34" goto show_log
if "%choice%"=="35" goto clear_log
if "%choice%"=="36" goto show_info

:: ========== ВЫХОД ==========
if "%choice%"=="0" goto exit

goto menu


:: ========== РЕАЛИЗАЦИЯ ФУНКЦИЙ ==========

:start_flask
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              🚀 ЗАПУСК FLASK СЕРВЕРА (ПОРТ 5000)                ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
call :check_python
if errorlevel 1 goto menu
cd /d "%BACKEND_DIR%" 2>nul
if errorlevel 1 (
    echo ❌ Ошибка: Папка backend не найдена!
    goto :pause_and_return
)
echo.
echo ⏳ Запуск сервера...
start "SkySwag Flask Server" cmd /k "title SkySwag Flask Server && cd /d %BACKEND_DIR% && python app.py"
echo.
echo ✅ Сервер запущен!
echo 📍 http://localhost:5000
echo.
call :log "Flask сервер запущен"
goto :pause_and_return

:start_static
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              🌐 ЗАПУСК СТАТИЧЕСКОГО СЕРВЕРА (ПОРТ 8000)         ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
cd /d "%FRONTEND_DIR%" 2>nul
if errorlevel 1 (
    echo ❌ Ошибка: Папка frontend не найдена!
    goto :pause_and_return
)
echo.
echo ⏳ Запуск сервера...
start "SkySwag Static Server" cmd /k "title SkySwag Static Server && cd /d %FRONTEND_DIR% && python -m http.server 8000"
echo.
echo ✅ Сервер запущен!
echo 📍 http://localhost:8000
echo.
call :log "Статический сервер запущен"
goto :pause_and_return

:start_both
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              🔄 ЗАПУСК ОБОИХ СЕРВЕРОВ                           ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
call :start_flask_nopause
call :start_static_nopause
echo.
echo ✅ Оба сервера запущены!
echo 📍 Flask: http://localhost:5000
echo 📍 Static: http://localhost:8000
echo.
call :log "Оба сервера запущены"
goto :pause_and_return

:start_flask_nopause
start "SkySwag Flask Server" cmd /k "title SkySwag Flask Server && cd /d %BACKEND_DIR% && python app.py"
exit /b

:start_static_nopause
start "SkySwag Static Server" cmd /k "title SkySwag Static Server && cd /d %FRONTEND_DIR% && python -m http.server 8000"
exit /b

:stop_servers
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              🛑 ОСТАНОВКА ВСЕХ СЕРВЕРОВ                         ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo ⏳ Останавливаем все процессы Python...
taskkill /f /im python.exe 2>nul
if errorlevel 1 (
    echo ❌ Нет запущенных процессов Python
) else (
    echo ✅ Все серверы остановлены
    call :log "Все серверы остановлены"
)
goto :pause_and_return

:restart_flask
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              🔄 ПЕРЕЗАПУСК FLASK СЕРВЕРА                        ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
taskkill /f /im python.exe 2>nul
timeout /t 2 /nobreak >nul
cd /d "%BACKEND_DIR%" 2>nul
start "SkySwag Flask Server" cmd /k "title SkySwag Flask Server && cd /d %BACKEND_DIR% && python app.py"
echo ✅ Сервер перезапущен!
call :log "Flask сервер перезапущен"
goto :pause_and_return

:install_deps
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              📦 УСТАНОВКА ЗАВИСИМОСТЕЙ                          ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
call :check_python
if errorlevel 1 goto menu
cd /d "%BACKEND_DIR%" 2>nul
if errorlevel 1 (
    echo ❌ Папка backend не найдена!
    goto :pause_and_return
)
echo.
echo ⏳ Установка пакетов...
echo.
pip install flask flask-sqlalchemy flask-migrate flask-cors pyjwt bcrypt email-validator python-dotenv
if errorlevel 1 (
    echo ❌ Ошибка установки!
) else (
    echo ✅ Все зависимости установлены!
    call :log "Установлены зависимости"
)
goto :pause_and_return

:create_db
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              🗄️  СОЗДАНИЕ БАЗЫ ДАННЫХ                           ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
call :check_python
if errorlevel 1 goto menu
cd /d "%BACKEND_DIR%" 2>nul
if errorlevel 1 (
    echo ❌ Папка backend не найдена!
    goto :pause_and_return
)
echo.
echo ⏳ Создаем таблицы...
python -c "from app import app, db; app.app_context().push(); db.create_all(); print('✅ База данных создана')"
if errorlevel 1 (
    echo ❌ Ошибка создания базы данных!
    echo    Убедитесь, что все зависимости установлены (пункт 6)
) else (
    echo ✅ База данных готова!
    call :log "База данных создана"
)
goto :pause_and_return

:init_alembic
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              📦 ИНИЦИАЛИЗАЦИЯ ALEMBIC                           ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
cd /d "%BACKEND_DIR%" 2>nul
if errorlevel 1 (
    echo ❌ Папка backend не найдена!
    goto :pause_and_return
)
if exist "migrations\" (
    echo ⚠️  Папка migrations уже существует!
    set /p confirm="Переинициализировать? (y/n): "
    if /i "!confirm!"=="y" (
        rmdir /s /q migrations 2>nul
        python -m flask db init
        echo ✅ Alembic переинициализирован
        call :log "Alembic переинициализирован"
    ) else (
        echo ❌ Отменено
    )
) else (
    python -m flask db init
    echo ✅ Alembic инициализирован
    call :log "Alembic инициализирован"
)
goto :pause_and_return

:upgrade_db
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              ⬆️  ПРИМЕНЕНИЕ МИГРАЦИЙ (UPGRADE)                  ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
cd /d "%BACKEND_DIR%" 2>nul
if errorlevel 1 (
    echo ❌ Папка backend не найдена!
    goto :pause_and_return
)
python -m flask db upgrade
echo.
echo ✅ Миграции применены!
call :log "Миграции применены"
goto :pause_and_return

:create_migration
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              📝 СОЗДАНИЕ НОВОЙ МИГРАЦИИ                         ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo 💡 Пример описания: "add_user_phone_field"
echo.
set /p message="📝 Описание миграции: "
if "%message%"=="" set message="auto_migration"
cd /d "%BACKEND_DIR%" 2>nul
if errorlevel 1 (
    echo ❌ Папка backend не найдена!
    goto :pause_and_return
)
python -m flask db migrate -m "%message%"
echo.
echo ✅ Миграция создана: %message%
call :log "Создана миграция: %message%"
goto :pause_and_return

:create_admin_with_password
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              👑  СОЗДАНИЕ АДМИНИСТРАТОРА                        ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
call :check_admin_password
if errorlevel 1 goto menu
cd /d "%BACKEND_DIR%" 2>nul
if errorlevel 1 (
    echo ❌ Папка backend не найдена!
    goto :pause_and_return
)
echo.
echo ⏳ Создаем администратора...
python -c "from app import app, db; from models import User; from auth import hash_password; app.app_context().push(); admin = User.query.filter_by(email='admin@skywag.ru').first(); admin = User(email='admin@skywag.ru', password_hash=hash_password('admin123'), role='admin', status='vip', bonus_points=100000, full_name='Администратор', phone='+7 (999) 123-45-67') if not admin else None; db.session.add(admin) if not User.query.filter_by(email='admin@skywag.ru').first() else None; db.session.commit(); print('✅ Администратор создан!'); print('Email: admin@skywag.ru'); print('Пароль: admin123')"
echo.
echo ✅ Администратор создан!
echo    Email: admin@skywag.ru
echo    Пароль: admin123
call :log "Администратор создан"
goto :pause_and_return

:create_test_user
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              👥 СОЗДАНИЕ ТЕСТОВОГО ПОЛЬЗОВАТЕЛЯ                 ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
cd /d "%BACKEND_DIR%" 2>nul
if errorlevel 1 (
    echo ❌ Папка backend не найдена!
    goto :pause_and_return
)
echo.
python -c "from app import app, db; from models import User; from auth import hash_password; app.app_context().push(); user = User.query.filter_by(email='test@test.com').first(); user = User(email='test@test.com', password_hash=hash_password('test123'), full_name='Тестовый Пользователь', phone='+7 (999) 111-22-33', status='standard', bonus_points=1000) if not user else None; db.session.add(user) if not User.query.filter_by(email='test@test.com').first() else None; db.session.commit(); print('✅ Тестовый пользователь создан!'); print('Email: test@test.com'); print('Пароль: test123')"
echo.
echo ✅ Тестовый пользователь создан!
echo    Email: test@test.com
echo    Пароль: test123
call :log "Тестовый пользователь создан"
goto :pause_and_return

:create_test_products
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              🚁 ДОБАВЛЕНИЕ ТЕСТОВЫХ ТОВАРОВ                     ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
cd /d "%BACKEND_DIR%" 2>nul
if errorlevel 1 (
    echo ❌ Папка backend не найдена!
    goto :pause_and_return
)
echo.
python -c "from app import app, db; from models import Product; app.app_context().push(); products = [Product(name='Airbus H130', model='H130', version='Basic', price=6100000, year=2025, model_file='helicopter.glb', in_stock=True), Product(name='Airbus H125', model='H125', version='Standard', price=4550000, year=2024, model_file='helicopter.glb', in_stock=True), Product(name='Robinson R66', model='R66', version='Turbine', price=1600000, year=2025, model_file='helicopter.glb', in_stock=True)]; [db.session.add(p) for p in products if not Product.query.filter_by(name=p.name, version=p.version).first()]; db.session.commit(); print('✅ Добавлено 3 тестовых товара')"
echo.
echo ✅ Тестовые товары добавлены!
call :log "Тестовые товары добавлены"
goto :pause_and_return

:create_test_order
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              📦 СОЗДАНИЕ ТЕСТОВОГО ЗАКАЗА                       ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
cd /d "%BACKEND_DIR%" 2>nul
if errorlevel 1 (
    echo ❌ Папка backend не найдена!
    goto :pause_and_return
)
echo.
python -c "from app import app, db; from models import User, Product, Order; app.app_context().push(); user = User.query.first(); product = Product.query.first(); if user and product: order = Order(user_id=user.id, product_id=product.id, total_price=product.price, bonus_earned=int(product.price*0.01)); db.session.add(order); db.session.commit(); print('✅ Тестовый заказ создан') else: print('❌ Нет пользователя или товара для создания заказа')"
echo.
call :log "Тестовый заказ создан"
goto :pause_and_return

:show_tables
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              📋 СПИСОК ТАБЛИЦ В БАЗЕ ДАННЫХ                     ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
if not exist "%DB_FILE%" (
    echo ❌ База данных не найдена! Сначала создайте БД (пункт 7)
    goto :pause_and_return
)
cd /d "%BACKEND_DIR%" 2>nul
echo.
sqlite3 instance\skywag.db ".tables"
goto :pause_and_return

:table_stats
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              📊 СТАТИСТИКА ПО ТАБЛИЦАМ                          ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
if not exist "%DB_FILE%" (
    echo ❌ База данных не найдена!
    goto :pause_and_return
)
cd /d "%BACKEND_DIR%" 2>nul
echo.
echo ╔════════════════════════════════╦════════════════╗
echo ║           Таблица              ║  Количество    ║
echo ╠════════════════════════════════╬════════════════╣
for %%t in (users orders products estimates page_views user_actions) do (
    for /f "tokens=*" %%c in ('sqlite3 instance\skywag.db "SELECT COUNT(*) FROM %%t;" 2^>nul') do (
        set "count=%%c"
        if "!count!"=="" set count=0
        echo ║   %%~t                        ║     !count!       ║
    )
)
echo ╚════════════════════════════════╩════════════════╝
goto :pause_and_return

:show_table_content
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              📄 СОДЕРЖИМОЕ ТАБЛИЦЫ                              ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
cd /d "%BACKEND_DIR%" 2>nul
if errorlevel 1 (
    echo ❌ Папка backend не найдена!
    goto :pause_and_return
)
echo.
echo 📋 Доступные таблицы:
sqlite3 instance\skywag.db ".tables"
echo.
set /p table="👉 Введите имя таблицы: "
if "%table%"=="" goto :pause_and_return
set /p limit="Сколько строк показать? (Enter=10): "
if "%limit%"=="" set limit=10
echo.
sqlite3 instance\skywag.db "SELECT * FROM %table% LIMIT %limit%;"
goto :pause_and_return

:sql_query
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              ⚡ ВЫПОЛНИТЬ SQL ЗАПРОС                            ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo 💡 Примеры:
echo    SELECT * FROM users;
echo    SELECT COUNT(*) FROM orders;
echo    DELETE FROM estimates WHERE id='xxx';
echo.
set /p query="📝 Введите SQL запрос: "
if "%query%"=="" goto :pause_and_return
cd /d "%BACKEND_DIR%" 2>nul
echo.
sqlite3 instance\skywag.db "%query%"
goto :pause_and_return

:backup_db
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              💾 СОЗДАНИЕ РЕЗЕРВНОЙ КОПИИ                        ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
if not exist "%DB_FILE%" (
    echo ❌ База данных не найдена!
    goto :pause_and_return
)
set timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
set backup_file=%BACKUP_DIR%\backup_%timestamp%.db
copy "%DB_FILE%" "%backup_file%" >nul
if errorlevel 1 (
    echo ❌ Ошибка создания копии!
) else (
    echo ✅ Копия создана: %backup_file%
    call :log "Создан бэкап: %backup_file%"
)
goto :pause_and_return

:restore_db
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              🔄 ВОССТАНОВЛЕНИЕ ИЗ РЕЗЕРВНОЙ КОПИИ              ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
dir "%BACKUP_DIR%\*.db" /b 2>nul
echo.
set /p backup="👉 Введите имя файла для восстановления: "
if "%backup%"=="" goto :pause_and_return
set backup_file=%BACKUP_DIR%\%backup%
if not exist "%backup_file%" (
    echo ❌ Файл не найден!
    goto :pause_and_return
)
echo.
set /p confirm="Восстановить? (yes/no): "
if /i not "%confirm%"=="yes" goto :pause_and_return
copy "%backup_file%" "%DB_FILE%" >nul
echo ✅ База данных восстановлена!
call :log "Восстановлена БД из %backup%"
goto :pause_and_return

:show_backups
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              📁 СПИСОК РЕЗЕРВНЫХ КОПИЙ                          ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
if not exist "%BACKUP_DIR%\*.db" (
    echo ❌ Нет сохраненных копий
) else (
    dir "%BACKUP_DIR%\*.db" /o-d
)
goto :pause_and_return

:clean_old_backups
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              🗑️  УДАЛЕНИЕ СТАРЫХ КОПИЙ (СТАРШЕ 30 ДНЕЙ)        ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
set /a deleted=0
forfiles /p "%BACKUP_DIR%" /m "backup_*.db" /d -30 /c "cmd /c del @file && echo Удален @file && set /a deleted+=1" 2>nul
if %deleted% equ 0 (
    echo ✅ Нет старых копий для удаления
) else (
    echo ✅ Удалено %deleted% старых копий
    call :log "Удалено %deleted% старых бэкапов"
)
goto :pause_and_return

:vacuum_db
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              🧹 ОПТИМИЗАЦИЯ БАЗЫ ДАННЫХ (VACUUM)               ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
if not exist "%DB_FILE%" (
    echo ❌ База данных не найдена!
    goto :pause_and_return
)
cd /d "%BACKEND_DIR%" 2>nul
sqlite3 instance\skywag.db "VACUUM;"
echo ✅ База данных оптимизирована!
call :log "Выполнен VACUUM"
goto :pause_and_return

:integrity_check
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              🔧 ПРОВЕРКА ЦЕЛОСТНОСТИ БАЗЫ ДАННЫХ               ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
if not exist "%DB_FILE%" (
    echo ❌ База данных не найдена!
    goto :pause_and_return
)
cd /d "%BACKEND_DIR%" 2>nul
sqlite3 instance\skywag.db "PRAGMA integrity_check;"
goto :pause_and_return

:export_sql
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              📊 ЭКСПОРТ БАЗЫ В SQL ФАЙЛ                         ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
set timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
set export_file=%BACKEND_DIR%\instance\export_%timestamp%.sql
cd /d "%BACKEND_DIR%" 2>nul
sqlite3 instance\skywag.db ".dump" > "%export_file%"
echo ✅ Экспорт завершен: %export_file%
call :log "Экспорт БД в %export_file%"
goto :pause_and_return

:import_sql
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              📥 ИМПОРТ ИЗ SQL ФАЙЛА                             ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
dir "%BACKEND_DIR%\instance\*.sql" /b 2>nul
echo.
set /p sql_file="👉 Введите имя файла для импорта: "
if "%sql_file%"=="" goto :pause_and_return
set import_file=%BACKEND_DIR%\instance\%sql_file%
if not exist "%import_file%" (
    echo ❌ Файл не найден!
    goto :pause_and_return
)
echo.
set /p confirm="Импортировать? (yes/no): "
if /i not "%confirm%"=="yes" goto :pause_and_return
cd /d "%BACKEND_DIR%" 2>nul
sqlite3 instance\skywag.db < "%import_file%"
echo ✅ Импорт завершен!
call :log "Импорт из %sql_file%"
goto :pause_and_return

:analytics_popular_pages
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              📈 ПОПУЛЯРНЫЕ СТРАНИЦЫ                             ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
call :check_admin_password
if errorlevel 1 goto menu
cd /d "%BACKEND_DIR%" 2>nul
echo.
sqlite3 instance\skywag.db "SELECT page_name, COUNT(*) as views FROM page_views GROUP BY page_name ORDER BY views DESC LIMIT 10;"
goto :pause_and_return

:analytics_user_activity
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              👥 АКТИВНОСТЬ ПОЛЬЗОВАТЕЛЕЙ ПО ДНЯМ                ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
call :check_admin_password
if errorlevel 1 goto menu
cd /d "%BACKEND_DIR%" 2>nul
echo.
sqlite3 instance\skywag.db "SELECT DATE(created_at) as date, COUNT(*) as views, COUNT(DISTINCT user_id) as users FROM page_views WHERE created_at >= DATE('now', '-7 days') GROUP BY DATE(created_at) ORDER BY date DESC;"
goto :pause_and_return

:analytics_page_views
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              📋 ПОСЛЕДНИЕ ПРОСМОТРЫ СТРАНИЦ                     ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
call :check_admin_password
if errorlevel 1 goto menu
cd /d "%BACKEND_DIR%" 2>nul
echo.
sqlite3 instance\skywag.db "SELECT id, page_name, user_id, time_spent, datetime(created_at, 'localtime') as created FROM page_views ORDER BY created_at DESC LIMIT 20;"
goto :pause_and_return

:analytics_user_actions
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              🖱️ ПОСЛЕДНИЕ ДЕЙСТВИЯ ПОЛЬЗОВАТЕЛЕЙ                ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
call :check_admin_password
if errorlevel 1 goto menu
cd /d "%BACKEND_DIR%" 2>nul
echo.
sqlite3 instance\skywag.db "SELECT id, action_type, action_target, user_id, datetime(created_at, 'localtime') as created FROM user_actions ORDER BY created_at DESC LIMIT 20;"
goto :pause_and_return

:clear_all_data_with_password
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              🧨 ОЧИСТКА ВСЕХ ДАННЫХ (НЕОБРАТИМО!)               ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
call :check_admin_password
if errorlevel 1 goto menu
echo.
echo ⚠️  ЭТО ДЕЙСТВИЕ УДАЛИТ ВСЕ ДАННЫЕ ИЗ БАЗЫ!
echo    Будут удалены: пользователи, заказы, товары, заявки, аналитика
echo.
set /p confirm="Введите 'DELETE ALL' для подтверждения: "
if /i not "%confirm%"=="DELETE ALL" goto :pause_and_return
echo.
set timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
copy "%DB_FILE%" "%BACKUP_DIR%\pre_clear_%timestamp%.db" >nul
cd /d "%BACKEND_DIR%" 2>nul
sqlite3 instance\skywag.db "DELETE FROM users; DELETE FROM orders; DELETE FROM products; DELETE FROM estimates; DELETE FROM page_views; DELETE FROM user_actions; VACUUM;"
echo.
echo ✅ Все данные удалены!
echo 💾 Резервная копия: %BACKUP_DIR%\pre_clear_%timestamp%.db
call :log "ВСЕ ДАННЫЕ УДАЛЕНЫ!"
goto :pause_and_return

:drop_and_recreate_with_password
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              🗑️  ПОЛНЫЙ СБРОС БАЗЫ ДАННЫХ                       ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
call :check_admin_password
if errorlevel 1 goto menu
echo.
echo ⚠️  ЭТО ДЕЙСТВИЕ УДАЛИТ БАЗУ ДАННЫХ ПОЛНОСТЬЮ!
echo.
set /p confirm="Введите 'DROP DATABASE' для подтверждения: "
if /i not "%confirm%"=="DROP DATABASE" goto :pause_and_return
echo.
set timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
copy "%DB_FILE%" "%BACKUP_DIR%\pre_drop_%timestamp%.db" >nul
del "%DB_FILE%" 2>nul
cd /d "%BACKEND_DIR%" 2>nul
python -c "from app import app, db; app.app_context().push(); db.create_all(); print('✅ Новая база данных создана')"
echo.
echo ✅ База данных пересоздана!
call :log "БД полностью пересоздана"
goto :pause_and_return

:reset_alembic_force_with_password
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              🔄 ПРИНУДИТЕЛЬНЫЙ СБРОС ALEMBIC                    ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
call :check_admin_password
if errorlevel 1 goto menu
echo.
echo ⚠️  ЭТО ДЕЙСТВИЕ СБРОСИТ ВСЕ МИГРАЦИИ!
set /p confirm="Продолжить? (yes/no): "
if /i not "%confirm%"=="yes" goto :pause_and_return
echo.
cd /d "%BACKEND_DIR%" 2>nul
rmdir /s /q migrations 2>nul
sqlite3 instance\skywag.db "DROP TABLE IF EXISTS alembic_version;" 2>nul
python -m flask db init
python -m flask db migrate -m "initial"
python -m flask db upgrade
echo.
echo ✅ Alembic сброшен и пересоздан!
call :log "Alembic принудительно сброшен"
goto :pause_and_return

:show_log
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              📋 ПОСЛЕДНИЕ ОПЕРАЦИИ ИЗ ЛОГА                      ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
if not exist "%LOG_FILE%" (
    echo ❌ Лог-файл не найден
) else (
    type "%LOG_FILE%" | findstr /n "^" | findstr "^[0-9]*:" | more +-30
)
goto :pause_and_return

:clear_log
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              🗑️  ОЧИСТКА ЛОГ-ФАЙЛА                              ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
set /p confirm="Очистить лог-файл? (yes/no): "
if /i not "%confirm%"=="yes" goto :pause_and_return
echo. > "%LOG_FILE%"
echo ✅ Лог-файл очищен
call :log "Лог-файл очищен"
goto :pause_and_return

:show_info
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              ℹ️  ИНФОРМАЦИЯ О ПРОЕКТЕ                           ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo   🚁 SkySwag - Премиальная продажа вертолетов с 3D визуализацией
echo.
echo   📁 Структура проекта:
echo      %PROJECT_ROOT%
echo      ├── backend\          - Python Flask сервер (API, БД)
echo      ├── frontend\         - HTML, CSS, JS, 3D модели
echo      └── skywag-manager.bat - Этот менеджер
echo.
echo   🔑 Тестовые аккаунты:
echo      Администратор: admin@skywag.ru / admin123
echo      Тестовый:      test@test.com / test123
echo.
echo   🔐 Админ-панель:
echo      URL: http://localhost:5000/admin-panel.html
echo      Мастер-пароль: SkySwagAdmin2024!@#$
echo.
echo   📊 Система аналитики:
echo      - История посещений пользователей
echo      - Трекинг действий (клики, отправки форм)
echo      - Популярные страницы
echo      - Активность пользователей по дням
echo.
echo   📍 Доступные страницы:
echo      Главная:     http://localhost:5000/
echo      Каталог:     http://localhost:5000/catalog.html
echo      Профиль:     http://localhost:5000/profile.html
echo      Новости:     http://localhost:5000/news.html
echo      Услуги:      http://localhost:5000/services.html
echo      О компании:  http://localhost:5000/about.html
echo      Лизинг:      http://localhost:5000/leasing.html
echo      Конфигуратор: http://localhost:5000/configurator.html
echo      3D просмотр: http://localhost:5000/view-model.html
echo.
echo   🛠️  Используемые технологии:
echo      Backend:  Flask, SQLite, JWT, Alembic, SQLAlchemy
echo      Frontend: HTML5, CSS3, JavaScript, Three.js
echo      Analytics: трекинг действий
echo.
echo   💡 Для запуска серверов используйте пункт меню 3
echo.
goto :pause_and_return

:exit
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                                                                  ║
echo ║              👋 Спасибо за использование SkySwag Manager!        ║
echo ║                                                                  ║
echo ║              🚁 sky is the limit                                 ║
echo ║                                                                  ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
call :log "Завершение работы"
timeout /t 2 /nobreak >nul
exit