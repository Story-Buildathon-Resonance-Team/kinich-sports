import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PropsWithChildren } from "react";
import Web3Providers from "./Web3Providers";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kinich Sports",
  description: "Your performance, your data, your rules.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang='en'>
      <body>
        <Web3Providers>
          <DynamicWidget />
          {children}
        </Web3Providers>
      </body>
    </html>
  );
}
