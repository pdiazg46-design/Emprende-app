@echo off
title Optimizador de Memoria - Emprende
echo ==========================================
echo       LIBERANDO MEMORIA Y CACHE
echo ==========================================
echo.
echo [1/2] Cerrando procesos de Node.js (Servidores antiguos)...
taskkill /F /IM node.exe >nul 2>&1
echo       Procesos cerrados.
echo.
echo [2/2] Limpiando cache de compilacion (.next)...
if exist app\.next rmdir /s /q app\.next
echo       Cache limpia.
echo.
echo ==========================================
echo       LISTO! TU PC ESTA OPTIMIZADO
echo ==========================================
echo.
echo Ahora puedes ejecutar START_EMPRENDE.bat con normalidad.
pause
