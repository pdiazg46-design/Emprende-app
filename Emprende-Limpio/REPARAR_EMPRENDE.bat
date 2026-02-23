@echo off
title Reparador Emprende v1.1
color 1f
echo ==========================================
echo      REPARADOR AUTOMATICO EMPRENDE
echo ==========================================
echo.
echo 1. Cerrando procesos antiguos...
taskkill /f /im node.exe >nul 2>&1
echo.
echo 2. Entrando a la carpeta de la aplicacion...
cd app
echo.
echo 3. Actualizando estructura de Base de Datos...
call npx prisma db push
echo.
echo 4. Regenerando Cliente Prisma...
call npx prisma generate
echo.
echo 5. Iniciando servidor de desarrollo...
echo    (Espera a que diga "Ready" y abre el navegador)
echo.
call npm run dev
pause
