import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, StickyNote } from 'lucide-react';
import './globals.css';

export const metadata: Metadata = {
  title: 'memo',
  description: 'Cloudflare D1を使ったシンプルなメモ帳アプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 h-16">
          <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
              <StickyNote className="w-6 h-6 text-accent" />
              <span>memo</span>
            </Link>
            <Link
              href="/notes/new"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>書く</span>
            </Link>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-12 md:py-16">{children}</main>
      </body>
    </html>
  );
}
