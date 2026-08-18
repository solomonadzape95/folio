import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Folio — your reading life",
  description: "A quiet, personal library for the books you want to remember.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
