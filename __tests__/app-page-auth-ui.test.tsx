import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HomePage from '@/app/page';

(globalThis as any).React = React;

const { mockGetAllNotes, mockGetCurrentUser } = vi.hoisted(() => ({
  mockGetAllNotes: vi.fn(),
  mockGetCurrentUser: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  getAllNotes: mockGetAllNotes,
}));

vi.mock('@/lib/auth', () => ({
  getCurrentUser: mockGetCurrentUser,
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/NoteCard', () => ({
  default: ({ note }: { note: { id: string; title: string } }) => (
    <article data-note-id={note.id}>{note.title}</article>
  ),
}));

describe('HomePage 認証分岐UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ログイン時は右上に「書く」ボタンを表示する', async () => {
    mockGetAllNotes.mockResolvedValue([
      {
        id: 'n1',
        title: 'title',
        content: 'content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });

    const html = renderToStaticMarkup(await HomePage());

    expect(html).toContain('書く');
    expect(html).not.toContain('ログインして書く');
  });

  it('未ログインかつ空状態では「ログインして書く」を表示する', async () => {
    mockGetAllNotes.mockResolvedValue([]);
    mockGetCurrentUser.mockResolvedValue(null);

    const html = renderToStaticMarkup(await HomePage());

    expect(html).toContain('ログインして書く');
    expect(html).not.toContain('最初のノートを書く');
  });
});
