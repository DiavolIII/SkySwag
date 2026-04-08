@echo off
echo ========================================
echo УСТАНОВКА PYTHON ОКРУЖЕНИЯ
echo ========================================
echo.

 Пути к Python
set PYTHON_PATHS=CPython312python.exe CUsers%USERNAME%AppDataLocalProgramsPythonPython312python.exe CProgram FilesPython312python.exe

 Ищем Python
for %%p in (%PYTHON_PATHS%) do (
    if exist %%p (
        echo ✅ Найден Python %%p
        set PYTHON_EXE=%%p
        goto found
    )
)

echo ❌ Python не найден!
echo.
echo Установите Python с python.org
echo Не забудьте поставить галочку Add Python to PATH
pause
exit b 1

found
cd d %~dp0
echo.
echo 📦 Создание виртуального окружения...
%PYTHON_EXE% -m venv venv
echo.
echo ✅ Виртуальное окружение создано!
echo.
echo 🔧 Активация окружения...
call venvScriptsactivate
echo.
echo 📦 Установка зависимостей...
pip install flask flask-sqlalchemy flask-migrate flask-cors pyjwt bcrypt email-validator python-dotenv
echo.
echo ✅ Готово!
echo.
echo Для активации окружения вручную выполните
echo   cd CSkySwagbackend
echo   venvScriptsactivate
echo.
pause