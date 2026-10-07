import type { Metadata, Viewport } from "next";
import { Archivo, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serif = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sharma Metal & Alloys — Alloy Wheels for Bikes & Cars · Palwal",
  description:
    "Sharma Metal & Alloys (SMA), Kulena, Palwal, Haryana — alloy wheels for bikes and cars in silver, gloss black, diamond cut and bronze finishes. Call or WhatsApp +91 89305 25200.",
};

export const viewport: Viewport = {
  themeColor: "#efebe4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        {children}
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
