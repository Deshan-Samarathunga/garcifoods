import type { Metadata } from "next";
import { Allura, Cormorant_Garamond, Manrope } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { env } from "@/lib/env";
import { siteConfig } from "@/lib/site";

import "bootstrap/dist/css/bootstrap.min.css";
import "./legacy-site.css";
import "./globals.css";

const allura = Allura({
  subsets: ["latin"],
  variable: "--font-allura",
  weight: "400",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
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
    <html lang="en">
      <body className={`${manrope.variable} ${cormorantGaramond.variable} ${allura.variable}`}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
