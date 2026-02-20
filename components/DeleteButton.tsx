'use client';

import { useState } from 'react';
import { deleteNoteAction } from '@/lib/actions';
import { Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteButtonProps {
  noteId: string;
}

export default function DeleteButton({ noteId }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'このノートを削除してもよいですか？この操作は取り消せません。'
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteNoteAction(noteId);
      if (!result.success) {
        setError(result.error);
        setIsDeleting(false);
      }
    } catch {
      setError('削除中に予期しないエラーが発生しました。');
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative group">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full right-0 mb-2 w-max px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 hover:text-white border border-red-500 hover:bg-red-500 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-400 dark:hover:text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
        <span>{isDeleting ? '削除中...' : '削除'}</span>
      </button>
    </div>
  );
}
