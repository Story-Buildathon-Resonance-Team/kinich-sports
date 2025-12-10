import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PropsWithChildren } from "react";
import Web3Providers from "./Web3Providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Kinich Sports",
  description: "Your performance, your data, your rules.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#030303",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang='en' className={`${inter.variable} antialiased`}>
      <body className={inter.className}>
        <Web3Providers>
          {children}
        </Web3Providers>
      </body>
    </html>
  );
}
