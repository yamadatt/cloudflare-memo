import { getAllNotes } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import NoteCard from '@/components/NoteCard';
import Link from 'next/link';
import { Plus, StickyNote } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const notes = await getAllNotes();
  const user = await getCurrentUser();

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            すべてのノート
          </h1>
          <p className="text-zinc-500 mt-2 font-medium flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full text-zinc-900 dark:text-zinc-100 text-sm">
              {notes.length}
            </span>
            <span>件のメモが保存されています</span>
          </p>
        </div>
        {user ? (
          <Link
            href="/notes/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>書く</span>
          </Link>
        ) : null}
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700 flex items-center justify-center mb-6">
            <StickyNote className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">ノートがありません</h3>
          <p className="text-zinc-500 max-w-[280px] mb-8 leading-relaxed">
            アイデアやメモを書き留めて、<br />クラウドに保存しましょう。
          </p>
          {user ? (
            <Link
              href="/notes/new"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-accent hover:bg-accent-hover rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              最初のノートを書く
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-accent hover:bg-accent-hover rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              ログインして書く
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
