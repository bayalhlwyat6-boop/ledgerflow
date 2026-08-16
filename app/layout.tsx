import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LedgerFlow",
  description: "AI Accounting Operations Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}