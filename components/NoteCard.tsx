'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import type { Note } from '@/lib/types';

interface NoteCardProps {
  note: Note;
}

export default function NoteCard({ note }: NoteCardProps) {
  const formattedDate = new Date(note.createdAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/notes/${note.id}`} className="block h-full">
        <div className="group h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none transition-all duration-300">
          <h2 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors truncate mb-3">
            {note.title}
          </h2>
          {note.content && (
            <p className="text-[15px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-3 leading-relaxed">
              {note.content}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <time className="text-xs font-medium text-zinc-400">{formattedDate}</time>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
