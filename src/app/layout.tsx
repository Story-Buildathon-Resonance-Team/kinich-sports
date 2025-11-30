import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PropsWithChildren } from "react";
import Web3Providers from "./Web3Providers";
import { Navigation } from "@/components/custom/navigation";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
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
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang='en' className={inter.variable}>
      <body className={inter.className}>
        <Web3Providers>
          <Navigation />
          {children}
        </Web3Providers>
      </body>
    </html>
  );
}
