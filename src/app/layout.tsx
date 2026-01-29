import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "StartupNetwork - Connect with Innovative Startups",
  description: "Explore startups, connect with founders. A directory for Startupbootcamp member startups.",
  keywords: ["startups", "founders", "network", "innovation", "entrepreneurship"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 antialiased font-sans">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
