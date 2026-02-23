Add-Type -AssemblyName System.Drawing
$path = 'c:\Users\pdiaz\Desarrollos\Emprende\app\public\logo.png'
$img = [System.Drawing.Image]::FromFile($path)
Write-Output "Width: , Height: "
$img.Dispose()
