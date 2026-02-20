import type { ValidationResult } from './types';

// タイトルと本文のバリデーション（本文は現在制限なし）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function validateNoteInput(
  title: string,
  _content: string
): ValidationResult {
  const errors: { title?: string; content?: string } = {};

  if (!title || title.trim().length === 0) {
    errors.title = 'タイトルを入力してください';
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}
