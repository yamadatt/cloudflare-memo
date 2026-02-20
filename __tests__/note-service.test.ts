import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createNoteService, updateNoteService, deleteNoteService } from '../lib/note-service';
import { InMemoryNotesRepository } from './helpers/in-memory-repository';
import type { INotesRepository } from '../lib/repository';

describe('createNoteService', () => {
  let repo: InMemoryNotesRepository;

  beforeEach(() => {
    repo = new InMemoryNotesRepository();
  });

  it('バリデーション失敗（空のタイトル）→ エラー返却', async () => {
    const result = await createNoteService(repo, '', '内容');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('タイトルを入力してください');
    }
  });

  it('バリデーション失敗（空白のみのタイトル）→ エラー返却', async () => {
    const result = await createNoteService(repo, '   ', '内容');
    expect(result.success).toBe(false);
  });

  it('成功 → noteId返却', async () => {
    const result = await createNoteService(repo, '有効なタイトル', '内容');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.noteId).toBeDefined();
      expect(typeof result.noteId).toBe('string');
    }
  });

  it('成功時にリポジトリへ保存される', async () => {
    const result = await createNoteService(repo, 'テストノート', '本文内容');
    expect(result.success).toBe(true);
    if (result.success) {
      const saved = await repo.getNoteById(result.noteId);
      expect(saved?.title).toBe('テストノート');
      expect(saved?.content).toBe('本文内容');
    }
  });

  it('タイトルがトリムされて保存される', async () => {
    const result = await createNoteService(repo, '  スペース付き  ', '内容');
    expect(result.success).toBe(true);
    if (result.success) {
      const saved = await repo.getNoteById(result.noteId);
      expect(saved?.title).toBe('スペース付き');
    }
  });

  it('DBエラー → エラー返却', async () => {
    const brokenRepo = {
      ...repo,
      createNote: vi.fn().mockRejectedValue(new Error('DB接続エラー')),
    } as unknown as INotesRepository;

    const result = await createNoteService(brokenRepo, '有効なタイトル', '内容');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('保存中にエラーが発生しました');
    }
  });
});

describe('updateNoteService', () => {
  let repo: InMemoryNotesRepository;
  let existingNoteId: string;

  beforeEach(async () => {
    repo = new InMemoryNotesRepository();
    const note = await repo.createNote({ title: '既存ノート', content: '既存内容' });
    existingNoteId = note.id;
  });

  it('バリデーション失敗（空のタイトル）→ エラー返却', async () => {
    const result = await updateNoteService(repo, existingNoteId, '', '内容');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('タイトルを入力してください');
    }
  });

  it('バリデーション失敗（空白のみのタイトル）→ エラー返却', async () => {
    const result = await updateNoteService(repo, existingNoteId, '\t\n', '内容');
    expect(result.success).toBe(false);
  });

  it('成功 → noteId返却', async () => {
    const result = await updateNoteService(repo, existingNoteId, '新しいタイトル', '新しい内容');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.noteId).toBe(existingNoteId);
    }
  });

  it('成功時にリポジトリが更新される', async () => {
    await updateNoteService(repo, existingNoteId, '更新後タイトル', '更新後内容');
    const updated = await repo.getNoteById(existingNoteId);
    expect(updated?.title).toBe('更新後タイトル');
    expect(updated?.content).toBe('更新後内容');
  });

  it('DBエラー → エラー返却', async () => {
    const brokenRepo = {
      ...repo,
      updateNote: vi.fn().mockRejectedValue(new Error('DB接続エラー')),
    } as unknown as INotesRepository;

    const result = await updateNoteService(brokenRepo, existingNoteId, '有効なタイトル', '内容');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('更新中にエラーが発生しました');
    }
  });
});

describe('deleteNoteService', () => {
  let repo: InMemoryNotesRepository;
  let existingNoteId: string;

  beforeEach(async () => {
    repo = new InMemoryNotesRepository();
    const note = await repo.createNote({ title: '削除対象ノート', content: '内容' });
    existingNoteId = note.id;
  });

  it('成功 → noteId返却', async () => {
    const result = await deleteNoteService(repo, existingNoteId);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.noteId).toBe(existingNoteId);
    }
  });

  it('成功後にリポジトリから削除される', async () => {
    await deleteNoteService(repo, existingNoteId);
    const deleted = await repo.getNoteById(existingNoteId);
    expect(deleted).toBeNull();
  });

  it('DBエラー → エラー返却', async () => {
    const brokenRepo = {
      ...repo,
      deleteNote: vi.fn().mockRejectedValue(new Error('DB接続エラー')),
    } as unknown as INotesRepository;

    const result = await deleteNoteService(brokenRepo, existingNoteId);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('削除中にエラーが発生しました');
    }
  });
});
