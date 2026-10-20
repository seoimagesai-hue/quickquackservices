import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { CookieConsent } from "@/components/cookies/cookie-consent";
import { OrganizationJsonLd } from "@/components/marketing/organization-json-ld";
import { brand } from "@/config/brand";
import "./globals.css";

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: brand.seoTitle,
    template: `%s · ${brand.name}`,
  },
  description: brand.seoDescription,
  metadataBase: new URL(brand.websiteUrl),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: brand.seoTitle,
    description: brand.seoDescription,
    siteName: brand.name,
    url: brand.websiteUrl,
    type: "website",
    images: [{ url: "/logo.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} ${dmSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background font-sans antialiased text-foreground">
        <OrganizationJsonLd />
        <ThemeProvider>
          <AuthSessionProvider>
            {children}
            <Toaster richColors position="top-center" closeButton theme="light" />
            <CookieConsent />
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
