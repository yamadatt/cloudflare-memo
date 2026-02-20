'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import type { ActionResult } from '@/lib/types';

type FormAction = (
  prevState: ActionResult,
  formData: FormData
) => Promise<ActionResult>;

interface NoteFormProps {
  action: FormAction;
  initialTitle?: string;
  initialContent?: string;
  cancelHref: string;
  submitLabel: string;
  noteId?: string;
}

const initialState: ActionResult = { success: true, noteId: '' };

export default function NoteForm({
  action,
  initialTitle = '',
  initialContent = '',
  cancelHref,
  submitLabel,
  noteId,
}: NoteFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto"
    >
      <div className="mb-10 flex items-center justify-between">
        <Link
          href={cancelHref}
          className="group flex items-center gap-2 text-zinc-400 hover:text-foreground transition-colors font-medium text-sm"
        >
          <div className="p-2 rounded-full group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>キャンセル</span>
        </Link>
      </div>

      <form action={formAction} className="space-y-12 pb-32">
        {noteId && <input type="hidden" name="id" value={noteId} />}

        {!state.success && state.error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{state.error}</p>
          </motion.div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={initialTitle}
            required
            className="w-full text-3xl md:text-5xl font-black text-foreground bg-transparent border-none outline-none placeholder:text-zinc-300 dark:placeholder:zinc-700 disabled:opacity-50"
            placeholder="タイトルを入力"
            disabled={isPending}
            autoFocus
          />
          <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800" />
        </div>

        <div className="space-y-4">
          <textarea
            id="content"
            name="content"
            defaultValue={initialContent}
            rows={15}
            className="w-full text-lg text-foreground bg-transparent border-none outline-none placeholder:text-zinc-300 dark:placeholder:zinc-700 disabled:opacity-50 resize-none leading-relaxed"
            placeholder="ここに内容を記述..."
            disabled={isPending}
          />
        </div>

        <div className="fixed bottom-8 left-0 right-0 px-6 pointer-events-none">
          <div className="max-w-3xl mx-auto flex justify-end pointer-events-auto">
            <button
              type="submit"
              disabled={isPending}
              className="group flex items-center gap-2 px-8 py-4 text-sm font-bold text-white bg-accent hover:bg-accent-hover rounded-full shadow-2xl shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isPending ? '保存中...' : submitLabel}</span>
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
