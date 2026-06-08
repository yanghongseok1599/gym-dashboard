import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GYM Dashboard",
  description: "Fitness Strategy AI dashboard for ITN Fitness operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
