@echo off
echo ===================================================
echo   REPARADOR AUTOMATICO DE SERVIDOR - EMPRENDE
echo ===================================================
echo.
echo 1. Deteniendo procesos de servidor antiguos (Node.js)...
taskkill /F /IM node.exe /T 2>nul
echo.

echo 2. Regenerando cliente de base de datos...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] No se pudo regenerar Prisma.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 3. Limpiando cache de Next.js...
if exist .next (
    rmdir /s /q .next
    echo Cache limpia.
)

echo.
echo ===================================================
echo   SISTEMA LIMPIO. INICIANDO SERVIDOR...
echo   (No cierres esta ventana)
echo ===================================================
call npm run dev
pause
