@echo off
echo ==========================================
echo      EMPRENDE BUSINESS OS - PC MODE
echo ==========================================
echo.
echo Iniciando sistema...
echo Por favor espere mientras se carga el servidor y la base de datos.
echo.

cd app
set FORCE_PC_SERVER=true
call npx electron .

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo HUBIO UN ERROR AL INICIAR.
    echo Asegurate de haber instalado las dependencias (npm install).
    pause
)
