import type { Metadata } from 'next';
import Link from 'next/link';
import { StickyNote } from 'lucide-react';
import { signOutAction } from '@/lib/auth-actions';
import { getCurrentUser } from '@/lib/auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'ログインすれば誰でも書けるmemo',
  description: 'Supabase を使ったシンプルなメモ帳アプリ',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="ja">
      <body className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 h-16">
          <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
              <StickyNote className="w-6 h-6 text-accent" />
              <span>ログインすれば誰でも書けるmemo</span>
            </Link>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span
                    className="text-sm hidden sm:block"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    {user.email}
                  </span>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-sm rounded-full border transition-all hover:shadow-sm active:scale-95"
                      style={{
                        color: 'var(--foreground-secondary)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      ログアウト
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold rounded-full border transition-all hover:shadow-sm active:scale-95"
                  style={{
                    color: 'var(--foreground)',
                    borderColor: 'var(--border)',
                  }}
                >
                  ログイン
                </Link>
              )}
            </div>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-12 md:py-16">{children}</main>
      </body>
    </html>
  );
}
