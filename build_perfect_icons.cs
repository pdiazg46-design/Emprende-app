using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public class Resizer {
    public static void Run(string srcPath, string rootDir) {
        Bitmap srcImg = new Bitmap(srcPath);
        int w = srcImg.Width, h = srcImg.Height;
        
        BitmapData data = srcImg.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        byte[] pixels = new byte[w * h * 4];
        Marshal.Copy(data.Scan0, pixels, 0, pixels.Length);
        srcImg.UnlockBits(data);
        
        int minX = w, minY = h, maxX = 0, maxY = 0;
        for (int i = 0; i < pixels.Length; i += 4) {
            byte b = pixels[i], g = pixels[i+1], r = pixels[i+2], a = pixels[i+3];
            if (a > 50) {
                if (r > 230 && g > 230 && b > 230) {
                    pixels[i+3] = 0; 
                } else {
                    int x = (i / 4) % w;
                    int y = (i / 4) / w;
                    if (x < minX) minX = x; 
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y; 
                    if (y > maxY) maxY = y;
                }
            }
        }
        
        int cropW = maxX - minX + 1;
        int cropH = maxY - minY + 1;
        
        Bitmap blueCrop = new Bitmap(cropW, cropH);
        Bitmap whiteCrop = new Bitmap(cropW, cropH);
        
        for (int y = 0; y < cropH; y++) {
            for (int x = 0; x < cropW; x++) {
                int srcI = ((y + minY) * w + (x + minX)) * 4;
                byte b = pixels[srcI], g = pixels[srcI+1], r = pixels[srcI+2], a = pixels[srcI+3];
                if (a > 50 && !(r > 230 && g > 230 && b > 230)) {
                    blueCrop.SetPixel(x, y, Color.FromArgb(a, r, g, b));
                    whiteCrop.SetPixel(x, y, Color.FromArgb(a, 255, 255, 255));
                } else {
                    blueCrop.SetPixel(x, y, Color.Transparent);
                    whiteCrop.SetPixel(x, y, Color.Transparent);
                }
            }
        }

        Action<Bitmap, string, int, int, float, Color> DrawIcon = (bmp, path, outW, outH, scaleRatio, bg) => {
            Bitmap outBmp = new Bitmap(outW, outH);
            using (Graphics gr = Graphics.FromImage(outBmp)) {
                gr.Clear(bg);
                if (scaleRatio > 0) {
                    gr.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
                    gr.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                    float targetW = outW * scaleRatio;
                    float targetH = outH * scaleRatio;
                    float scale = Math.Min(targetW / bmp.Width, targetH / bmp.Height);
                    int finalW = (int)(bmp.Width * scale);
                    int finalH = (int)(bmp.Height * scale);
                    int posX = (outW - finalW) / 2;
                    int posY = (outH - finalH) / 2;
                    gr.DrawImage(bmp, posX, posY, finalW, finalH);
                }
            }
            outBmp.Save(path, ImageFormat.Png);
            outBmp.Dispose();
        };

        // PWA Maskable (White BG, Blue Parabola 80% to avoid Android padding issues)
        DrawIcon(blueCrop, rootDir + @"\app\public\icon-192-maskable.png", 192, 192, 0.80f, Color.White);
        DrawIcon(blueCrop, rootDir + @"\app\public\icon-512-maskable.png", 512, 512, 0.80f, Color.White);
        
        // PWA Any (Transparent BG, Blue Parabola 98% because there is no padding constraint)
        DrawIcon(blueCrop, rootDir + @"\app\public\icon-192.png", 192, 192, 0.98f, Color.Transparent);
        DrawIcon(blueCrop, rootDir + @"\app\public\icon-512.png", 512, 512, 0.98f, Color.Transparent);
        DrawIcon(blueCrop, rootDir + @"\app\public\logo.png", 512, 512, 0.98f, Color.Transparent);
        
        // iOS PWA Home Icon (White BG, Apple does not allow transparent icons on homescreen)
        DrawIcon(blueCrop, rootDir + @"\app\public\pwa-icon.png", 512, 512, 0.80f, Color.White);
        DrawIcon(blueCrop, rootDir + @"\app\apple-icon.png", 180, 180, 0.80f, Color.White);
        DrawIcon(blueCrop, rootDir + @"\app\favicon.ico", 128, 128, 0.98f, Color.Transparent);

        // NATIVE ANDROID: True Adaptive Icons Setup
        DrawIcon(blueCrop, rootDir + @"\Emprende-Limpio\app\assets\icon-background.png", 1024, 1024, 0.0f, Color.White);
        DrawIcon(blueCrop, rootDir + @"\Emprende-Limpio\app\assets\icon-foreground.png", 1024, 1024, 0.60f, Color.Transparent); // Safe zone strictly 60%
        DrawIcon(blueCrop, rootDir + @"\Emprende-Limpio\app\assets\icon.png", 1024, 1024, 0.60f, Color.White);

        // NATIVE ANDROID SPLASH: Emprende Blue BG with WHITE Parabola. Absolute perfection.
        Color eBlue = Color.FromArgb(0, 86, 179);
        DrawIcon(whiteCrop, rootDir + @"\Emprende-Limpio\app\assets\splash.png", 2732, 2732, 0.22f, eBlue);
        DrawIcon(whiteCrop, rootDir + @"\Emprende-Limpio\app\assets\splash-dark.png", 2732, 2732, 0.22f, eBlue);

        blueCrop.Dispose(); whiteCrop.Dispose(); srcImg.Dispose();
    }
}
