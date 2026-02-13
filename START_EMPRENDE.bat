@echo off
title Emprende - Servidor Local
echo ==========================================
echo       INICIANDO PROYECTO EMPRENDE
echo ==========================================
echo.
cd app
echo [1/2] Iniciando base de datos local (SQLite)...
call npx prisma generate
echo.
echo [2/2] Levantando servidor web...
echo.
echo Abriendo navegador en http://localhost:3000...
start http://localhost:3000
echo.
call npm run dev
pause
