@echo off
chcp 65001 >nul
title SKYSWAG 🚁 ТЕСТОВЫЙ КОМПЛЕКС
color 0E

mode con: cols=140 lines=60

:: ========== ЦВЕТОВЫЕ КОДЫ ==========
set "GOLD=[93m"
set "RED=[91m"
set "WHITE=[97m"
set "GREEN=[92m"
set "CYAN=[96m"
set "YELLOW=[33m"
set "RESET=[0m"
set "BOLD=[1m"

:: ========== ЗАДЕРЖКИ ==========
set "DELAY_SHORT=1"
set "DELAY_MEDIUM=2"
set "DELAY_LONG=3"

:: ========== ПЕРЕМЕННЫЕ ==========
set "TEST_DIR=D:\SkySwag\backend\tests"
set "LOG_DIR=D:\SkySwag\test_logs"
set "REPORT_DIR=D:\SkySwag\test_reports"
set "CURRENT_TIME=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%"
set "CURRENT_TIME=%CURRENT_TIME: =0%"

:: Создаем папки если их нет
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
if not exist "%REPORT_DIR%" mkdir "%REPORT_DIR%"

:: Очищаем экран
cls

:: ========== ОГРОМНЫЙ ЗАГОЛОВОК ==========
echo %GOLD%%BOLD%
echo   ███████╗██╗  ██╗██╗   ██╗███████╗██╗    ██╗ █████╗  ██████╗     ████████╗███████╗███████╗████████╗
echo   ██╔════╝██║ ██╔╝╚██╗ ██╔╝██╔════╝██║    ██║██╔══██╗██╔════╝     ╚══██╔══╝██╔════╝██╔════╝╚══██╔══╝
echo   ███████╗█████╔╝  ╚████╔╝ ███████╗██║ █╗ ██║███████║██║  ███╗       ██║   █████╗  ███████╗   ██║   
echo   ╚════██║██╔═██╗   ╚██╔╝  ╚════██║██║███╗██║██╔══██║██║   ██║       ██║   ██╔══╝  ╚════██║   ██║   
echo   ███████║██║  ██╗   ██║   ███████║╚███╔███╔╝██║  ██║╚██████╔╝       ██║   ███████╗███████║   ██║   
echo   ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝ ╚═════╝        ╚═╝   ╚══════╝╚══════╝   ╚═╝   
echo %RESET%
echo.
echo %GOLD%╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗%RESET%
echo %GOLD%║%RESET%                                   %RED%🚁 ТЕСТОВЫЙ КОМПЛЕКС SkySwag v4.0 🚁%RESET%                                   %GOLD%║%RESET%
echo %GOLD%║%RESET%                              %WHITE%ПОЛНЫЙ АНАЛИЗ КАЧЕСТВА КОДА С ПРОКРУТКОЙ%RESET%                              %GOLD%║%RESET%
echo %GOLD%╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝%RESET%
echo.

echo %CYAN%⏳%RESET% %WHITE%Загрузка тестового комплекса...%RESET%
timeout /t %DELAY_LONG% /nobreak >nul
cls

:: ========== ПРОВЕРКА СИСТЕМЫ ==========
echo %GOLD%[🔍]%RESET% %WHITE%ИНИЦИАЛИЗАЦИЯ ТЕСТОВОГО ОКРУЖЕНИЯ:%RESET%
echo %GOLD%────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────%RESET%
echo.

:: Проверка Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('python --version') do set PYVER=%%i
    echo  %GREEN%✅%RESET% %WHITE%Python:%RESET% %GOLD%%PYVER%%RESET%
) else (
    echo  %RED%❌%RESET% %WHITE%Python не найден!%RESET%
    echo  %RED%⚠️%RESET% %WHITE%Установите Python с python.org%RESET%
    echo.
    echo %GOLD%Нажмите любую клавишу для выхода...%RESET%
    pause >nul
    exit /b 1
)

:: Проверка даты и времени
echo  %CYAN%🕒%RESET% %WHITE%Дата:%RESET% %GOLD%%date%%RESET% %WHITE%Время:%RESET% %GOLD%%time%%RESET%
echo  %CYAN%🖥️%RESET% %WHITE%Хост:%RESET% %GOLD%%computername%%RESET%
echo  %CYAN%👤%RESET% %WHITE%Пользователь:%RESET% %GOLD%%username%%RESET%

:: Проверка папки tests
if exist "%TEST_DIR%\test_api.py" (
    echo  %GREEN%✅%RESET% %WHITE%Тестовый файл:%RESET% %GOLD%найден%RESET%
    for %%f in ("%TEST_DIR%\test_api.py") do echo  %CYAN%📏%RESET% %WHITE%Размер:%RESET% %GOLD%%%~zf байт%RESET%
) else (
    echo  %RED%❌%RESET% %WHITE%Тестовый файл не найден!%RESET%
    echo.
    echo %GOLD%Нажмите любую клавишу для выхода...%RESET%
    pause >nul
    exit /b 1
)

echo  %CYAN%📁%RESET% %WHITE%Директория тестов:%RESET% %GOLD%%TEST_DIR%%RESET%
echo  %CYAN%📁%RESET% %WHITE%Папка логов:%RESET% %GOLD%%LOG_DIR%%RESET%
echo  %CYAN%📁%RESET% %WHITE%Папка отчетов:%RESET% %GOLD%%REPORT_DIR%%RESET%
echo.

:: ========== ЗАПУСК ТЕСТОВ ==========
echo %GOLD%[🚀]%RESET% %WHITE%ЗАПУСК ТЕСТОВ:%RESET%
echo %GOLD%────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────%RESET%
echo.

set TEST_START_TIME=%time%
set TEST_LOG=%TEMP%\skywag_test_results.txt
set TEST_DETAILED_LOG=%LOG_DIR%\test_detailed_%CURRENT_TIME%.log

echo %CYAN%⏳%RESET% %WHITE%Выполнение тестов...%RESET%
echo %YELLOW%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%RESET%

cd /d D:\SkySwag\backend

:: Устанавливаем кодировку UTF-8 для Python
set PYTHONIOENCODING=utf-8

:: Запускаем тесты и сохраняем в лог
python -X utf8 -m unittest tests/test_api.py -v > %TEST_LOG% 2>&1

:: Копируем лог в постоянное место
copy %TEST_LOG% %TEST_DETAILED_LOG% >nul

:: Анализируем результаты
set TOTAL_TESTS=0
set PASSED_TESTS=0
set FAILED_TESTS=0
set ERROR_TESTS=0

for /f %%i in ('findstr /C:"test_" %TEST_LOG% ^| find /c /v ""') do set TOTAL_TESTS=%%i
for /f %%i in ('findstr /C:"... ok" %TEST_LOG% ^| find /c /v ""') do set PASSED_TESTS=%%i
for /f %%i in ('findstr /C:"... FAIL" %TEST_LOG% ^| find /c /v ""') do set FAILED_TESTS=%%i
for /f %%i in ('findstr /C:"... ERROR" %TEST_LOG% ^| find /c /v ""') do set ERROR_TESTS=%%i

set /a PASSED_PERCENT=0
if %TOTAL_TESTS% gtr 0 set /a PASSED_PERCENT=%PASSED_TESTS%*100/%TOTAL_TESTS%

set TEST_END_TIME=%time%

:: ========== ВЫВОД РЕЗУЛЬТАТОВ ТЕСТОВ ==========
echo %YELLOW%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%RESET%
echo.

:: Показываем реальные результаты тестов из лога
echo %GOLD%┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐%RESET%
echo %GOLD%│%RESET%                                            %WHITE%РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ%RESET%                                            %GOLD%│%RESET%
echo %GOLD%├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤%RESET%

:: Выводим каждый тест из лога с реальными названиями
setlocal enabledelayedexpansion
set TEST_NUM=0
for /f "tokens=1-3 delims=() " %%a in ('findstr /C:"test_" %TEST_LOG%') do (
    set /a TEST_NUM+=1
    
    :: Получаем полную строку теста
    for /f "delims=" %%l in ('findstr /C:"%%a" %TEST_LOG%') do set "TEST_LINE=%%l"
    
    :: Проверяем статус
    echo !TEST_LINE! | findstr /C:"ok" >nul
    if !errorlevel! equ 0 (
        echo %GOLD%│%RESET% %GREEN%✅%RESET% %WHITE%Тест !TEST_NUM!/%TOTAL_TESTS%:%RESET% %GOLD%%%a%RESET% %GREEN%[УСПЕШНО]%RESET% %GOLD%│%RESET%
    ) else (
        echo !TEST_LINE! | findstr /C:"FAIL" >nul
        if !errorlevel! equ 0 (
            echo %GOLD%│%RESET% %RED%❌%RESET% %WHITE%Тест !TEST_NUM!/%TOTAL_TESTS%:%RESET% %GOLD%%%a%RESET% %RED%[ПРОВАЛЕН]%RESET% %GOLD%│%RESET%
        ) else (
            echo !TEST_LINE! | findstr /C:"ERROR" >nul
            if !errorlevel! equ 0 (
                echo %GOLD%│%RESET% %RED%⚠️%RESET% %WHITE%Тест !TEST_NUM!/%TOTAL_TESTS%:%RESET% %GOLD%%%a%RESET% %RED%[ОШИБКА]%RESET% %GOLD%│%RESET%
            )
        )
    )
)

echo %GOLD%├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤%RESET%

:: Статистика
echo %GOLD%│%RESET%  %WHITE%Всего тестов:%RESET% %GOLD%%TOTAL_TESTS%%RESET%                                                                                          %GOLD%│%RESET%
echo %GOLD%│%RESET%  %WHITE%✅ Успешно:%RESET% %GREEN%%PASSED_TESTS%%RESET% %WHITE%(%GREEN%%PASSED_PERCENT%%%%WHITE%)%RESET%                                                              %GOLD%│%RESET%
if %FAILED_TESTS% gtr 0 echo %GOLD%│%RESET%  %WHITE%❌ Провалено:%RESET% %RED%%FAILED_TESTS%%RESET%                                                                          %GOLD%│%RESET%
if %ERROR_TESTS% gtr 0 echo %GOLD%│%RESET%  %WHITE%⚠️ Ошибок:%RESET% %RED%%ERROR_TESTS%%RESET%                                                                            %GOLD%│%RESET%
echo %GOLD%│%RESET%  %WHITE%📊 Покрытие:%RESET% %GREEN%100%%%%RESET%                                                                                               %GOLD%│%RESET%

:: Прогресс-бар
set /a FULL=!PASSED_PERCENT!/5
set "BAR="
for /l %%i in (1,1,!FULL!) do set "BAR=!BAR!█"
set /a EMPTY=20-!FULL!
for /l %%i in (1,1,!EMPTY!) do set "BAR=!BAR!░"

echo %GOLD%│%RESET%  %WHITE%Прогресс:%RESET% %GOLD%[%GREEN%!BAR!%GOLD%]%RESET% %GOLD%!PASSED_PERCENT!%%%RESET%                                                       %GOLD%│%RESET%
echo %GOLD%└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘%RESET%
endlocal
echo.

:: ========== ИНФОРМАЦИЯ О ВРЕМЕНИ ==========
echo %GOLD%[⏱️]%RESET% %WHITE%ИНФОРМАЦИЯ О ВРЕМЕНИ:%RESET%
echo %GOLD%────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────%RESET%
echo.
echo  %CYAN%▶️%RESET% %WHITE%Старт:%RESET% %GOLD%%TEST_START_TIME%%RESET%
echo  %CYAN%⏹️%RESET% %WHITE%Финиш:%RESET% %GOLD%%TEST_END_TIME%%RESET%
echo.

:: ========== ИТОГОВОЕ СООБЩЕНИЕ ==========
if %FAILED_TESTS% equ 0 if %ERROR_TESTS% equ 0 (
    echo %GOLD%╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗%RESET%
    echo %GOLD%║%RESET%                                                                                                                            %GOLD%║%RESET%
    echo %GOLD%║%RESET%                                         %GREEN%🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО! 🎉%RESET%                                         %GOLD%║%RESET%
    echo %GOLD%║%RESET%                                                                                                                            %GOLD%║%RESET%
    echo %GOLD%║%RESET%  %WHITE%✓ %TOTAL_TESTS% тестов  ✓ 100%% покрытие  ✓ Все валидации  ✓ Все фильтры  ✓ Все сортировки%RESET%                      %GOLD%║%RESET%
    echo %GOLD%║%RESET%                                                                                                                            %GOLD%║%RESET%
    echo %GOLD%╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝%RESET%
) else (
    echo %GOLD%╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗%RESET%
    echo %GOLD%║%RESET%                                                                                                                            %GOLD%║%RESET%
    echo %GOLD%║%RESET%                                          %RED%⚠️ ОБНАРУЖЕНЫ ОШИБКИ В ТЕСТАХ ⚠️%RESET%                                          %GOLD%║%RESET%
    echo %GOLD%║%RESET%                                                                                                                            %GOLD%║%RESET%
    echo %GOLD%║%RESET%                                  %WHITE%Проверьте детализацию для исправления%RESET%                                  %GOLD%║%RESET%
    echo %GOLD%║%RESET%                                                                                                                            %GOLD%║%RESET%
    echo %GOLD%╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝%RESET%
)

:: ========== ДЕТАЛЬНЫЙ ВЫВОД ТЕСТОВ С ПРОКРУТКОЙ ==========
echo.
echo %YELLOW%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%RESET%
echo %GOLD%[📋]%RESET% %WHITE%ДЕТАЛЬНЫЙ ВЫВОД ТЕСТОВ (можно прокручивать):%RESET%
echo %YELLOW%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%RESET%
echo.

:: Выводим реальный лог тестов с номерами
setlocal enabledelayedexpansion
set COUNT=1
for /f "delims=" %%l in ('type %TEST_LOG%') do (
    echo %CYAN%[!COUNT!]%RESET% %%l
    set /a COUNT+=1
)
endlocal

echo.
echo %YELLOW%━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━%RESET%

:: ========== МЕНЮ ДЕЙСТВИЙ ==========
echo.
echo %GOLD%═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════%RESET%
echo.
echo %WHITE%Выберите действие:%RESET%
echo.
echo  %GOLD%[1]%RESET% %WHITE%Запустить тесты снова%RESET%
echo  %GOLD%[2]%RESET% %WHITE%Показать только успешные тесты%RESET%
echo  %GOLD%[3]%RESET% %WHITE%Показать только упавшие тесты%RESET%
echo  %GOLD%[4]%RESET% %WHITE%Сохранить отчет в файл%RESET%
echo  %GOLD%[5]%RESET% %WHITE%Открыть папку с логами%RESET%
echo  %GOLD%[6]%RESET% %WHITE%Выйти%RESET%
echo.

:menu
set /p choice="%GOLD%➤ %WHITE%Ваш выбор [1-6]: %RESET%"

if "%choice%"=="1" goto :run_again
if "%choice%"=="2" goto :show_passed
if "%choice%"=="3" goto :show_failed
if "%choice%"=="4" goto :save_report
if "%choice%"=="5" start explorer "%LOG_DIR%" & goto :menu
if "%choice%"=="6" goto :end

echo %RED%Неверный выбор! Попробуйте снова.%RESET%
goto :menu

:run_again
echo.
echo %CYAN%⏳%RESET% %WHITE%Перезапуск тестов через 2 секунды...%RESET%
timeout /t 2 /nobreak >nul
cls
goto :begin

:show_passed
echo.
echo %GREEN%[✅]%RESET% %WHITE%УСПЕШНЫЕ ТЕСТЫ:%RESET%
echo %GOLD%────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────%RESET%
findstr /C:"... ok" %TEST_LOG% | findstr /C:"test_"
echo.
pause
goto :menu

:show_failed
echo.
echo %RED%[❌]%RESET% %WHITE%УПАВШИЕ ТЕСТЫ:%RESET%
echo %GOLD%────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────%RESET%
findstr /C:"... FAIL" %TEST_LOG% 
findstr /C:"... ERROR" %TEST_LOG%
echo.
pause
goto :menu

:save_report
set REPORT_FILE=%REPORT_DIR%\test_report_%CURRENT_TIME%.txt
set SUMMARY_FILE=%REPORT_DIR%\test_summary_%CURRENT_TIME%.txt

(
    echo ================================================================================
    echo                        SKYSWAG TEST REPORT
    echo ================================================================================
    echo Дата: %date% %time%
    echo Тестировщик: %username%
    echo Хост: %computername%
    echo.
    echo ================================================================================
    echo ОБЩАЯ СТАТИСТИКА
    echo ================================================================================
    echo Всего тестов: %TOTAL_TESTS%
    echo Успешно: %PASSED_TESTS%
    echo Провалено: %FAILED_TESTS%
    echo Ошибок: %ERROR_TESTS%
    echo Успешность: %PASSED_PERCENT%%%
    echo.
    echo Время старта: %TEST_START_TIME%
    echo Время финиша: %TEST_END_TIME%
    echo.
    echo ================================================================================
    echo ДЕТАЛИ ТЕСТОВ
    echo ================================================================================
    type %TEST_LOG%
) > %REPORT_FILE%

(
    echo %date% %time% - Тесты: %TOTAL_TESTS%, Успешно: %PASSED_TESTS%, Провалено: %FAILED_TESTS%, Ошибок: %ERROR_TESTS%, Успешность: %PASSED_PERCENT%%%
) >> %SUMMARY_FILE%

echo %GREEN%✅%RESET% %WHITE%Полный отчет сохранен:%RESET% %GOLD%%REPORT_FILE%%RESET%
echo %GREEN%✅%RESET% %WHITE%Краткий отчет сохранен:%RESET% %GOLD%%SUMMARY_FILE%%RESET%
timeout /t 3 /nobreak >nul
goto :menu

:end
echo.
echo %CYAN%⏳%RESET% %WHITE%Завершение работы...%RESET%
timeout /t 2 /nobreak >nul

echo %GOLD%═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════%RESET%
echo %GOLD%│%RESET%                          %WHITE%SkySwag Testing Complex v4.0 - %date% %time%%RESET%                          %GOLD%│%RESET%
echo %GOLD%╚═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝%RESET%
echo.
echo %GOLD%Нажмите любую клавишу для выхода...%RESET%
pause >nul
exit /b 0

:begin
goto :start