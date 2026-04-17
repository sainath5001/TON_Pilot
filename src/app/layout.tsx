import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TON Pilot",
  description: "Hackathon MVP starter on TON"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

