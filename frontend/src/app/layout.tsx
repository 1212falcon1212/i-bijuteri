import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { WebVitals } from "@/components/analytics/WebVitals";

const inter = Inter({
  variable: "--font-body-loaded",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-display-loaded",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "i-Bijuteri | Türkiye'nin B2B Bijuteri Pazaryeri",
    template: "%s | i-Bijuteri",
  },
  description:
    "Toptan bijuteri ticaretini yeniden tanımladık. Üretici, ithalatçı ve perakendeciler için B2B pazaryeri.",
  keywords: [
    "bijuteri",
    "B2B",
    "pazaryeri",
    "toptan bijuteri",
    "kolye",
    "küpe",
    "yüzük",
    "bileklik",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "64x64" },
      { url: "/icons/icon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.png",
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "i-Bijuteri",
    startupImage: ["/icons/apple-touch-icon.png"],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    title: "i-Bijuteri | Türkiye'nin B2B Bijuteri Pazaryeri",
    description:
      "Toptan bijuteri ticaretini yeniden tanımladık. Üretici, ithalatçı ve perakendeciler için B2B pazaryeri.",
    siteName: "i-Bijuteri",
  },
  twitter: {
    card: "summary_large_image",
    title: "i-Bijuteri | Türkiye'nin B2B Bijuteri Pazaryeri",
    description:
      "Toptan bijuteri ticaretini yeniden tanımladık. Üretici, ithalatçı ve perakendeciler için B2B pazaryeri.",
  },
};

export const viewport: Viewport = {
  themeColor: "#B89968",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://i-bijuteri.com" />
        <link rel="dns-prefetch" href="https://i-bijuteri.com" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased overflow-x-hidden bg-[var(--bg)] text-[var(--ink)]`}>
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false} storageKey="frontend-theme">
          <AuthProvider>
            <WebVitals />
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
