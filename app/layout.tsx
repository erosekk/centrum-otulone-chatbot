import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Centrum Otulone — Wirtualny Pomocnik",
  description: "Chatbot informacyjny Centrum Terapii dla Kobiet Otulone w Gdańsku",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
