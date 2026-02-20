import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NoteDetailPage from '@/app/notes/[id]/page';

(globalThis as any).React = React;

const { mockGetNoteById, mockGetCurrentUser } = vi.hoisted(() => ({
  mockGetNoteById: vi.fn(),
  mockGetCurrentUser: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  getNoteById: mockGetNoteById,
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

vi.mock('@/components/DeleteButton', () => ({
  default: () => <button>削除</button>,
}));

describe('NoteDetailPage 認証分岐UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetNoteById.mockResolvedValue({
      id: 'n1',
      title: 'title',
      content: 'content',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it('ログイン時は「編集」「削除」を表示する', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });

    const html = renderToStaticMarkup(
      await NoteDetailPage({ params: Promise.resolve({ id: 'n1' }) })
    );

    expect(html).toContain('編集');
    expect(html).toContain('削除');
  });

  it('未ログイン時は「編集」「削除」を非表示にする', async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const html = renderToStaticMarkup(
      await NoteDetailPage({ params: Promise.resolve({ id: 'n1' }) })
    );

    expect(html).not.toContain('編集');
    expect(html).not.toContain('削除');
  });
});
