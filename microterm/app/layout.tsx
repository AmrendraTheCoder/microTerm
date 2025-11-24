import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import '@coinbase/onchainkit/styles.css';

export const metadata: Metadata = {
  title: "MicroTerm - Unbundled Financial Intelligence",
  description: "Pay-per-insight financial terminal powered by micro-payments on Base",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

