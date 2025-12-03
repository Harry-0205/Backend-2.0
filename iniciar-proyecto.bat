@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Iniciando Backend y Frontend
echo ========================================
echo.

REM Verificar si MySQL ya está corriendo
netstat -ano | findstr ":3306" >nul
if %errorlevel% neq 0 (
    echo [0/3] MySQL no esta corriendo. Iniciando MySQL...
    if exist "C:\xampp\mysql_start.bat" (
        start "MySQL" "C:\xampp\mysql_start.bat"
        timeout /t 3 /nobreak >nul
        echo MySQL iniciado correctamente.
    ) else if exist "C:\xampp\xampp_start.exe" (
        start "" "C:\xampp\xampp_start.exe"
        timeout /t 3 /nobreak >nul
        echo XAMPP iniciado correctamente.
    ) else (
        echo ADVERTENCIA: No se encontro XAMPP. Por favor, inicia MySQL manualmente.
        echo.
    )
) else (
    echo [0/3] MySQL ya esta corriendo en puerto 3306.
)
echo.

REM Crear archivo temporal para backend
echo @echo off > temp_backend.bat
echo cd /d "%~dp0backend" >> temp_backend.bat

REM Configurar JAVA_HOME
if exist "C:\Program Files\Java\jdk-21" (
    echo set "JAVA_HOME=C:\Program Files\Java\jdk-21" >> temp_backend.bat
    set "JAVA_HOME=C:\Program Files\Java\jdk-21"
) else if exist "C:\Program Files\Java\jdk-17" (
    echo set "JAVA_HOME=C:\Program Files\Java\jdk-17" >> temp_backend.bat
    set "JAVA_HOME=C:\Program Files\Java\jdk-17"
) else if exist "C:\Program Files\Eclipse Adoptium\jdk-21" (
    echo set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21" >> temp_backend.bat
    set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21"
) else if exist "C:\Program Files\Eclipse Adoptium\jdk-17" (
    echo set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17" >> temp_backend.bat
    set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17"
) else if exist "C:\Program Files\OpenJDK\jdk-21" (
    echo set "JAVA_HOME=C:\Program Files\OpenJDK\jdk-21" >> temp_backend.bat
    set "JAVA_HOME=C:\Program Files\OpenJDK\jdk-21"
) else if exist "C:\Program Files\OpenJDK\jdk-17" (
    echo set "JAVA_HOME=C:\Program Files\OpenJDK\jdk-17" >> temp_backend.bat
    set "JAVA_HOME=C:\Program Files\OpenJDK\jdk-17"
) else (
    echo ERROR: No se encontro Java instalado en las ubicaciones comunes
    echo Por favor, instala Java JDK 17 o superior
    del temp_backend.bat 2>nul
    pause
    exit /b 1
)

echo set "PATH=%%JAVA_HOME%%\bin;%%PATH%%" >> temp_backend.bat
echo echo Java configurado: %%JAVA_HOME%% >> temp_backend.bat
echo echo Iniciando Spring Boot... >> temp_backend.bat
echo mvn spring-boot:run >> temp_backend.bat
echo pause >> temp_backend.bat

echo Java encontrado en: %JAVA_HOME%
echo.

REM Iniciar el Backend (Spring Boot)
echo [1/3] Iniciando Backend (Spring Boot)...
start "Backend - Spring Boot" cmd /k temp_backend.bat

REM Esperar unos segundos antes de iniciar el frontend
timeout /t 8 /nobreak >nul

REM Iniciar el Frontend (React)
echo [2/3] Iniciando Frontend (React)...
start "Frontend - React" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ========================================
echo   Proyecto iniciado correctamente!
echo ========================================
echo   MySQL: puerto 3306
echo   Backend: http://localhost:8080
echo   Frontend: http://localhost:3000
echo ========================================
echo.
echo NOTA: Si el backend falla, asegurate de que MySQL
echo este corriendo. Puedes usar el Panel de Control de XAMPP.
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
