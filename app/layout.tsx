import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "AI Нейрондық желі платформасы",
  description: "Нейрондық желілерді оқытуға арналған интерактивті сайт",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kk">
      <body>
        <Providers>{children}</Providers>
        <Script
          src="https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}