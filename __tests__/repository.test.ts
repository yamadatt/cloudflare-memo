import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryNotesRepository } from './helpers/in-memory-repository';
import type { Note } from '../lib/types';

describe('InMemoryNotesRepository (INotesRepository 契約テスト)', () => {
  let repo: InMemoryNotesRepository;

  beforeEach(() => {
    repo = new InMemoryNotesRepository();
  });

  describe('getAllNotes', () => {
    it('空リストを返す', async () => {
      const notes = await repo.getAllNotes();
      expect(notes).toEqual([]);
    });

    it('作成日時の降順で返す', async () => {
      // フェイクタイマーで時刻を制御
      const note1: Note = {
        id: 'id-1',
        title: '最初のノート',
        content: '内容1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      const note2: Note = {
        id: 'id-2',
        title: '2番目のノート',
        content: '内容2',
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      };
      const note3: Note = {
        id: 'id-3',
        title: '3番目のノート',
        content: '内容3',
        createdAt: '2024-01-03T00:00:00.000Z',
        updatedAt: '2024-01-03T00:00:00.000Z',
      };

      repo.seed([note1, note2, note3]);
      const notes = await repo.getAllNotes();

      expect(notes[0].id).toBe('id-3');
      expect(notes[1].id).toBe('id-2');
      expect(notes[2].id).toBe('id-1');
    });
  });

  describe('getNoteById', () => {
    it('存在するIDでNoteを返す', async () => {
      const created = await repo.createNote({ title: 'テスト', content: '内容' });
      const found = await repo.getNoteById(created.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe('テスト');
    });

    it('存在しないIDでnullを返す', async () => {
      const result = await repo.getNoteById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('createNote', () => {
    it('保存・取得のラウンドトリップ', async () => {
      const input = { title: 'タイトル', content: '本文' };
      const created = await repo.createNote(input);

      const retrieved = await repo.getNoteById(created.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.title).toBe(input.title);
      expect(retrieved?.content).toBe(input.content);
    });

    it('UUIDを生成する', async () => {
      const note = await repo.createNote({ title: 'テスト', content: '' });
      // UUID v4 形式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(note.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('タイムスタンプを記録する', async () => {
      const before = new Date().toISOString();
      const note = await repo.createNote({ title: 'テスト', content: '' });
      const after = new Date().toISOString();

      expect(note.createdAt >= before).toBe(true);
      expect(note.createdAt <= after).toBe(true);
      expect(note.updatedAt).toBe(note.createdAt);
    });

    it('複数のノートが独立して保存される', async () => {
      const note1 = await repo.createNote({ title: 'ノート1', content: '内容1' });
      const note2 = await repo.createNote({ title: 'ノート2', content: '内容2' });

      expect(note1.id).not.toBe(note2.id);
      expect(repo.size()).toBe(2);
    });
  });

  describe('updateNote', () => {
    it('更新が反映される', async () => {
      const created = await repo.createNote({ title: '元のタイトル', content: '元の内容' });
      await repo.updateNote({ id: created.id, title: '新しいタイトル', content: '新しい内容' });

      const updated = await repo.getNoteById(created.id);
      expect(updated?.title).toBe('新しいタイトル');
      expect(updated?.content).toBe('新しい内容');
    });

    it('updatedAtが変化する', async () => {
      const created = await repo.createNote({ title: 'タイトル', content: '内容' });
      const originalUpdatedAt = created.updatedAt;

      // 1秒待って更新
      await new Promise((resolve) => setTimeout(resolve, 10));

      await repo.updateNote({ id: created.id, title: '更新', content: '更新内容' });
      const updated = await repo.getNoteById(created.id);

      expect(updated).not.toBeNull();
      expect(updated!.updatedAt >= originalUpdatedAt).toBe(true);
    });

    it('存在しないIDで例外をスローする', async () => {
      await expect(
        repo.updateNote({ id: 'non-existent', title: 'タイトル', content: '内容' })
      ).rejects.toThrow('ノートが見つかりませんでした: non-existent');
    });
  });

  describe('deleteNote', () => {
    it('削除後に取得するとnullを返す', async () => {
      const created = await repo.createNote({ title: 'テスト', content: '内容' });
      await repo.deleteNote(created.id);

      const result = await repo.getNoteById(created.id);
      expect(result).toBeNull();
    });

    it('存在しないIDの削除はエラーなし', async () => {
      await expect(repo.deleteNote('non-existent')).resolves.toBeUndefined();
    });
  });

  describe('テスト補助メソッド', () => {
    it('reset() で全データが削除される', async () => {
      await repo.createNote({ title: 'ノート1', content: '' });
      await repo.createNote({ title: 'ノート2', content: '' });

      repo.reset();
      const notes = await repo.getAllNotes();
      expect(notes).toEqual([]);
    });

    it('seed() でデータを初期投入できる', async () => {
      const seedNotes: Note[] = [
        {
          id: 'seed-1',
          title: 'シードノート1',
          content: '内容1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      repo.seed(seedNotes);
      const found = await repo.getNoteById('seed-1');
      expect(found?.title).toBe('シードノート1');
    });
  });
});
