import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SessionProvider } from "@/components/layout/session-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: {
    default: "Seller — Premium Digital Products",
    template: "%s | Seller",
  },
  description: "Discover and purchase premium digital products: templates, software, assets, courses, and licenses from verified creators.",
  metadataBase: new URL("https://onedollarsell.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Seller",
    title: "Seller — Premium Digital Products",
    description: "Premium digital marketplace for templates, software, assets, courses, and licenses.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seller — Premium Digital Products",
    description: "Premium digital marketplace for templates, software, assets, courses, and licenses.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <SessionProvider>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
