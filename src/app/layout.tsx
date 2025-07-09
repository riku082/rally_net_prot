import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BadmintonProvider } from "@/context/BadmintonContext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rally Net - バドミントン解析システム",
  description: "Rally Net - バドミントンの配球分析システム「ヨシダシステム」",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <title>Rally Net - バドミントン解析システム</title>
        <meta name="description" content="Rally Net - バドミントンの配球分析システム「ヨシダシステム」" />
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
