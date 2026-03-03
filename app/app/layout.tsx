import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: '--font-montserrat' });
const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "Emprende",
  description: "Tu punto de venta y gestión de negocios inteligente. Haz crecer tu emprendimiento al siguiente nivel.",
  manifest: "/manifest.json",
  icons: {
    apple: "/pwa-icon.png?v=perfect6",
  },
  openGraph: {
    title: "Emprende SaaS & POS",
    description: "Tu punto de venta y gestión de negocios inteligente.",
    url: "https://emprende-atsit.vercel.app",
    siteName: "Emprende",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Emprende Dashboard",
      },
    ],
    locale: "es_CL",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Emprende",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
  viewportFit: "cover",
}

import { Providers } from "@/components/Providers";
import { PWARegistration } from "@/components/PWARegistration";
import { InstallPrompt } from "@/components/InstallPrompt";
import { MobileFrame } from "@/components/MobileFrame";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${inter.variable} font-sans antialiased bg-[#F4F7F9]`}
        suppressHydrationWarning
      >
        <PWARegistration />
        <InstallPrompt />
        <Providers>
          <MobileFrame>
            {children}
          </MobileFrame>
        </Providers>
      </body>
    </html>
  );
}
