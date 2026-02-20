import { describe, it, expect } from 'vitest';
import { validateNoteInput } from '../lib/validations';

describe('validateNoteInput', () => {
  describe('有効な入力', () => {
    it('有効なタイトルと本文でバリデーション成功', () => {
      const result = validateNoteInput('テストタイトル', 'テスト本文');
      expect(result.valid).toBe(true);
    });

    it('本文が空でもバリデーション成功', () => {
      const result = validateNoteInput('タイトル', '');
      expect(result.valid).toBe(true);
    });

    it('タイトルが1文字でもバリデーション成功', () => {
      const result = validateNoteInput('A', 'some content');
      expect(result.valid).toBe(true);
    });
  });

  describe('無効な入力', () => {
    it('空文字タイトルでバリデーション失敗', () => {
      const result = validateNoteInput('', '本文');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.title).toBe('タイトルを入力してください');
      }
    });

    it('スペースのみのタイトルでバリデーション失敗', () => {
      const result = validateNoteInput('   ', '本文');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.title).toBeDefined();
      }
    });

    it('タブのみのタイトルでバリデーション失敗', () => {
      const result = validateNoteInput('\t\t', '本文');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.title).toBeDefined();
      }
    });

    it('改行のみのタイトルでバリデーション失敗', () => {
      const result = validateNoteInput('\n\n', '本文');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.title).toBeDefined();
      }
    });
  });
});
