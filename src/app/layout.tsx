import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BadmintonProvider } from "@/context/BadmintonContext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "配球分析「ヨシダシステム」",
  description: "バドミントンの配球分析システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <title>配球分析「ヨシダシステム」</title>
        <meta name="description" content="バドミントンの配球分析システム" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <BadmintonProvider>
            {children}
          </BadmintonProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
