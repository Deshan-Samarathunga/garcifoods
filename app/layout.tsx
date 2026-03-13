import type { Metadata } from "next";
import { Google_Sans_Flex } from "next/font/google";

import { AppShell } from "@/components/app-shell";
import { env } from "@/lib/env";
import { siteConfig } from "@/lib/site";

import "bootstrap/dist/css/bootstrap.min.css";
import "./legacy-site.css";
import "./globals.css";

const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-google-sans",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: siteConfig.defaultTitle,
    template: "Garci | %s",
  },
  description: siteConfig.description,
  keywords: ["Garci", "Sri Lankan flour", "jackfruit flour", "banana flour", "natural nutrition"],
  openGraph: {
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    url: env.siteUrl,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/assets/images/brand/logo-garci-sticker.png",
        width: 2676,
        height: 1600,
        alt: "Garci logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    images: ["/assets/images/brand/logo-garci-sticker.png"],
  },
  icons: {
    icon: [
      {
        url: "/assets/images/brand/favicon.png",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={googleSansFlex.variable}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
