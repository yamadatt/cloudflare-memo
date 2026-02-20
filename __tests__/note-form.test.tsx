// @vitest-environment jsdom

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteForm from '@/components/NoteForm';
import type { ActionResult } from '@/lib/types';

(globalThis as { React: typeof React }).React = React;

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

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe('NoteForm', () => {
  it('プレビュー中でも textarea[name="content"] をフォーム内に保持する', async () => {
    const action = vi.fn(
      async (_prevState: ActionResult, _formData: FormData): Promise<ActionResult> => ({
        success: true,
        noteId: '',
      })
    );
    const user = userEvent.setup();

    render(<NoteForm action={action} cancelHref="/" submitLabel="作成" />);

    await user.click(screen.getByRole('button', { name: 'プレビュー' }));

    const textarea = document.querySelector('textarea[name="content"]');
    expect(textarea).not.toBeNull();
  });

  it('プレビュー状態で送信しても本文が action に渡る', async () => {
    const action = vi.fn(
      async (_prevState: ActionResult, _formData: FormData): Promise<ActionResult> => ({
        success: true,
        noteId: '',
      })
    );
    const user = userEvent.setup();

    render(<NoteForm action={action} cancelHref="/" submitLabel="作成" />);

    await user.type(screen.getByPlaceholderText('タイトルを入力'), 'タイトル');
    await user.type(screen.getByPlaceholderText('ここに内容を記述...'), '## 見出し\n本文');
    await user.click(screen.getByRole('button', { name: 'プレビュー' }));
    await user.click(screen.getByRole('button', { name: '作成' }));

    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(1);
    });

    const formData = action.mock.calls[0][1] as FormData;
    expect(formData.get('content')).toBe('## 見出し\n本文');
  });
});
