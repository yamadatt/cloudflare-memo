'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export default function NewNoteHeaderButton() {
  const pathname = usePathname();
  const normalizedPath = normalizePathname(pathname);

  const isNewNotePage = normalizedPath === '/notes/new';
  const isEditNotePage = /^\/notes\/[^/]+\/edit$/.test(normalizedPath);

  if (isNewNotePage || isEditNotePage) {
    return null;
  }

  return (
    <Link
      href="/notes/new"
      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-95"
    >
      <Plus className="w-4 h-4" />
      <span>書く</span>
    </Link>
  );
}
