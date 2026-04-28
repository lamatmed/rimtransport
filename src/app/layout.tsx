import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "RimTransport | Covoiturage en Mauritanie",
  description: "La première plateforme de covoiturage en Mauritanie. Voyagez ensemble, économisez plus.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RimTransport",
  },
};

export const viewport: Viewport = {
  themeColor: "#006233",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { MobileNav } from "@/components/MobileNav";
import { Header } from "@/components/Header";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { ApprovalGuard } from "@/components/ApprovalGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme="light">
      <body className={outfit.variable}>
        <ConvexClientProvider>
          <LanguageProvider>
            <Header />
            <ApprovalGuard>
              <main className="container fade-in">
                {children}
              </main>
            </ApprovalGuard>
            <MobileNav />
          </LanguageProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
