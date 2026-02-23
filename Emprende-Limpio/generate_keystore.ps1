
$ErrorActionPreference = "Stop"

# Configuración
$KEYSTORE_NAME = "upload-keystore.jks"
$KEY_ALIAS = "upload"
$KEY_PASS = "android" # Contraseña simple para upload key (la seguridad real la pone Google Play App Signing)
$VALIDITY_DAYS = 10000
$DNAME = "CN=Emprende, OU=IT, O=Emprende, L=Santiago, ST=RM, C=CL"

$ANDROID_APP_DIR = "app/android/app"

Write-Host "Generando Upload Key para Play Store..." -ForegroundColor Cyan

# 1. Verificar si java keytool está disponible
try {
    keytool -help | Out-Null
} catch {
    Write-Error "keytool no encontrado. Asegúrate de tener Java instalado y en el PATH."
}

# 2. Generar Keystore
$keystorePath = Join-Path $ANDROID_APP_DIR $KEYSTORE_NAME

if (Test-Path $keystorePath) {
    Write-Warning "El keystore ya existe en: $keystorePath"
    Write-Warning "No se sobrescribirá para evitar pérdida de acceso."
} else {
    keytool -genkey -v -keystore $keystorePath -alias $KEY_ALIAS -keyalg RSA -keysize 2048 -validity $VALIDITY_DAYS -storepass $KEY_PASS -keypass $KEY_PASS -dname $DNAME
    Write-Host "Keystore generado en: $keystorePath" -ForegroundColor Green
}

# 3. Crear archivo keystore.properties para no hardcodear passwords en build.gradle
$propsPath = Join-Path $ANDROID_APP_DIR "keystore.properties"
$propsContent = @"
storePassword=$KEY_PASS
keyPassword=$KEY_PASS
keyAlias=$KEY_ALIAS
storeFile=$KEYSTORE_NAME
"@

Set-Content -Path $propsPath -Value $propsContent
Write-Host "Archivo keystore.properties creado." -ForegroundColor Green

Write-Host "`nLISTO! Ahora tu proyecto Android está configurado para firmar automáticamente." -ForegroundColor Start
