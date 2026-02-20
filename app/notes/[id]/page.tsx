import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNoteById } from '@/lib/db';
import DeleteButton from '@/components/DeleteButton';
import { ArrowLeft, Edit2, Calendar, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface NoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { id } = await params;
  const note = await getNoteById(id);

  if (!note) {
    notFound();
  }

  const createdAt = new Date(note.createdAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const updatedAt = new Date(note.updatedAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <Link
          href="/"
          className="group flex items-center gap-2 text-zinc-400 hover:text-foreground transition-colors font-medium text-sm"
        >
          <div className="p-2 rounded-full group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>一覧に戻る</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/notes/${note.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all"
          >
            <Edit2 className="w-4 h-4" />
            <span>編集</span>
          </Link>
          <DeleteButton noteId={note.id} />
        </div>
      </div>

      <article className="space-y-10">
        <header className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-[1.1]">
            {note.title}
          </h1>

          <div className="flex flex-wrap gap-6 text-sm font-medium text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>作成: {createdAt}</span>
            </div>
            {createdAt !== updatedAt && (
              <div className="flex items-center gap-2 text-zinc-300 dark:text-zinc-600">
                <Clock className="w-4 h-4" />
                <span>更新: {updatedAt}</span>
              </div>
            )}
          </div>
        </header>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          {note.content ? (
            <p className="text-xl text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {note.content}
            </p>
          ) : (
            <p className="text-zinc-400 italic text-lg">本文がありません</p>
          )}
        </div>
      </article>
    </div>
  );
}
