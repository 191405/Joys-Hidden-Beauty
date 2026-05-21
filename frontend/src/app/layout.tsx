import type { Metadata } from "next";
import { Playfair_Display, Lato, Cinzel, Pinyon_Script } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LenisProvider from "@/lib/lenis";
import GoogleAuthProviderWrapper from "@/components/auth/GoogleAuthProviderWrapper";
import AuthGuard from "@/components/auth/AuthGuard";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
});

const pinyon = Pinyon_Script({
  variable: "--font-pinyon",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JOYSHIDDENBEAUTY | Quality Beauty & Bespoke Services",
  description:
    "Where quality meets artistry. Discover our curated collection of premium skincare, makeup, and fragrance. Book bespoke beauty appointments.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "JOYSHIDDENBEAUTY | Quality Beauty & Bespoke Services",
    description: "Where quality meets artistry. Curated beauty collections & bespoke services.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${lato.variable} ${cinzel.variable} ${pinyon.variable} antialiased`}
        suppressHydrationWarning
      >
        <GoogleAuthProviderWrapper>
          <AuthGuard>
            <LenisProvider>
              <Header />
              <main className="page-wrapper">{children}</main>
              <Footer />
            </LenisProvider>
          </AuthGuard>
        </GoogleAuthProviderWrapper>
      </body>
    </html>
  );
}
