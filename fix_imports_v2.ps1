# fix_imports_v2.ps1
# Script para corregir rutas de importación en módulos migrados de Finanza Fácil

Write-Host "🔄 Iniciando corrección de imports para Finanza Fácil (V2)..." -ForegroundColor Cyan

$baseDir = "c:\Users\pdiaz\Desarrollos\Emprende\app"

# 1. Corregir imports en Components
Write-Host "1️⃣ Ajustando componentes..."
if (Test-Path "$baseDir\components\finanza") {
    Get-ChildItem -Path "$baseDir\components\finanza" -Include "*.tsx","*.ts" -Recurse | ForEach-Object {
        $content = Get-Content $_.FullName
        $newContent = $content -replace '@\/components\/', '@/components/finanza/' `
                               -replace '@\/lib\/', '@/lib/finanza/' `
                               -replace '\.\.\/app\/actions\/', '@/app/(apps)/finanza/actions/'
        
        if ($content -ne $newContent) {
            Set-Content $_.FullName $newContent
            Write-Host "   ✅ Corregido: $($_.Name)" -ForegroundColor Green
        }
    }
} else {
    Write-Host "⚠️ No se encontró la carpeta components/finanza" -ForegroundColor Yellow
}

# 2. Corregir imports en Apps/PageRoutes
Write-Host "2️⃣ Ajustando páginas (app route)..."
if (Test-Path "$baseDir\app\(apps)\finanza") {
    Get-ChildItem -Path "$baseDir\app\(apps)\finanza" -Include "*.tsx","*.ts" -Recurse | ForEach-Object {
        $content = Get-Content $_.FullName
        $newContent = $content -replace '@\/components\/', '@/components/finanza/' `
                               -replace '@\/lib\/', '@/lib/finanza/'
        
        if ($content -ne $newContent) {
            Set-Content $_.FullName $newContent
            Write-Host "   ✅ Corregido: $($_.Name)" -ForegroundColor Green
        }
    }
} else {
    Write-Host "⚠️ No se encontró la carpeta app/(apps)/finanza" -ForegroundColor Yellow
}

# 3. Corregir imports en Libs (Si existen)
Write-Host "3️⃣ Ajustando librerías..."
if (Test-Path "$baseDir\lib\finanza") {
    Get-ChildItem -Path "$baseDir\lib\finanza" -Include "*.tsx","*.ts" -Recurse | ForEach-Object {
        $content = Get-Content $_.FullName
        $newContent = $content -replace '@\/lib\/', '@/lib/finanza/'
        
        if ($content -ne $newContent) {
            Set-Content $_.FullName $newContent
            Write-Host "   ✅ Corregido: $($_.Name)" -ForegroundColor Green
        }
    }
}

Write-Host "✨ ¡Listo! Los imports han sido redirigidos a la estructura modular." -ForegroundColor Cyan
