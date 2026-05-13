import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Barlow } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-serif",
});

const barlow = Barlow({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: "Mattia ne fa diciotto",
  description: "13.05.2026 · Manfredonia — lascia un ricordo della serata.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#F5EFE3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${instrumentSerif.variable} ${barlow.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
