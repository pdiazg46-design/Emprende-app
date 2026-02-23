@echo off
title Emprende - Servidor Local
echo ==========================================
echo       INICIANDO PROYECTO EMPRENDE
echo ==========================================
echo.
cd app
echo [0/3] Creando respaldo de seguridad...
if not exist backups mkdir backups
if exist prisma\dev.db copy /Y prisma\dev.db backups\dev.db.bak >nul
if exist prisma\prisma\dev.db copy /Y prisma\prisma\dev.db backups\dev.db.nested.bak >nul
echo.
echo [1/3] Iniciando base de datos local (SQLite)...
call npx prisma generate
echo.
echo [2/2] Levantando servidor web...
echo.
echo Abriendo navegador en http://localhost:3000...
start http://localhost:3000
echo.
call npm run dev
pause
