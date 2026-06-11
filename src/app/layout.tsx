import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

/**
 * Brand fonts per the Nudgr Design and Brand Kit v1.0:
 *   Fraunces — display (screen/section/card titles, big numbers, italic emphasis)
 *   Inter    — body, labels, chips, buttons, nav, lists (the working layer)
 *
 * Both loaded as variable fonts so any weight in the kit range works.
 */
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nudgr",
  description: "Nudge your goals. Nudge your people. Keep going.",
  manifest: "/manifest.json",
  applicationName: "Nudgr",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nudgr",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Nudgr",
    description: "Nudge your goals. Nudge your people. Keep going.",
    url: "https://app.mynudgr.com",
    siteName: "Nudgr",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#4A6B4E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
