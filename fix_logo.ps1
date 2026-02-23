Add-Type -AssemblyName System.Drawing

$srcFile = "c:\Users\pdiaz\Desarrollos\Emprende\app\public\logo.png"

$src = [System.Drawing.Image]::FromFile($srcFile)
$srcWidth = $src.Width
$srcHeight = $src.Height

$size = 1024
$bgBmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bgBmp)

# Fondo blanco puro
$g.Clear([System.Drawing.Color]::White)

# Android safe zone para íconos adaptativos es ~60% del cuadro (para que el círculo de recorte no corte las orillas).
$maxInternalSize = 650
$scaleWidth = $maxInternalSize / $srcWidth
$scaleHeight = $maxInternalSize / $srcHeight
$scale = [Math]::Min($scaleWidth, $scaleHeight)

$newW = [int]($srcWidth * $scale)
$newH = [int]($srcHeight * $scale)

$posX = [int](($size - $newW) / 2)
$posY = [int](($size - $newH) / 2)

$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($src, $posX, $posY, $newW, $newH)

$dstFile = "c:\Users\pdiaz\Desarrollos\Emprende\logo_cuadrado.png"
$bgBmp.Save($dstFile, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bgBmp.Dispose()
$src.Dispose()

Write-Output "Imagen Cuadrada Perfecta generada."
