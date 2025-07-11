import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { BadmintonProvider } from '@/context/BadmintonContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});


export const metadata: Metadata = {
  title: 'Rally Net - バドミントン分析システム',
  description: 'バドミントンの試合分析、選手管理、MBTI診断を統合した総合プラットフォーム',
  keywords: 'バドミントン,分析,試合,選手管理,MBTI診断',
  authors: [{ name: 'Rally Net Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Rally Net - バドミントン分析システム',
    description: 'バドミントンの試合分析、選手管理、MBTI診断を統合した総合プラットフォーム',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rally Net - バドミントン分析システム',
    description: 'バドミントンの試合分析、選手管理、MBTI診断を統合した総合プラットフォーム',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <meta name="theme-color" content="#3B82F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Rally Net" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <AuthProvider>
          <BadmintonProvider>
            {children}
          </BadmintonProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
