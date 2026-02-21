import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InMemoryNotesRepository } from './helpers/in-memory-repository';

const mockRedirect = vi.hoisted(() => vi.fn());
const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockGetRepository = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({ redirect: mockRedirect }));
vi.mock('@/lib/auth', () => ({ getCurrentUser: mockGetCurrentUser }));
vi.mock('@/lib/db', () => ({ getRepository: mockGetRepository }));

import { createNoteAction, updateNoteAction, deleteNoteAction } from '../lib/actions';

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.append(key, value);
  }
  return fd;
}

const INITIAL_STATE = { success: false as const, error: '' };

describe('createNoteAction', () => {
  let repo: InMemoryNotesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new InMemoryNotesRepository();
    mockGetRepository.mockResolvedValue(repo);
  });

  it('未認証 → auth エラーを返却し redirect 未呼び出し', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const fd = makeFormData({ title: 'タイトル', content: '内容' });

    const result = await createNoteAction(INITIAL_STATE, fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('バリデーション失敗（空タイトル）→ エラーを返却', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
    const fd = makeFormData({ title: '', content: '内容' });

    const result = await createNoteAction(INITIAL_STATE, fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('成功 → redirect("/") を呼び出す', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
    const fd = makeFormData({ title: '新しいノート', content: '本文' });

    const result = await createNoteAction(INITIAL_STATE, fd);

    expect(result.success).toBe(true);
    expect(mockRedirect).toHaveBeenCalledWith('/');
  });

  it('FormData から title と content を正しく取得する', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
    const fd = makeFormData({ title: '正確なタイトル', content: '正確な内容' });

    await createNoteAction(INITIAL_STATE, fd);

    const saved = (await repo.getAllNotes())[0];
    expect(saved?.title).toBe('正確なタイトル');
    expect(saved?.content).toBe('正確な内容');
  });
});

describe('updateNoteAction', () => {
  let repo: InMemoryNotesRepository;
  let existingNoteId: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    repo = new InMemoryNotesRepository();
    const note = await repo.createNote({ title: '既存ノート', content: '既存内容' });
    existingNoteId = note.id;
    mockGetRepository.mockResolvedValue(repo);
  });

  it('未認証 → auth エラーを返却し redirect 未呼び出し', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const fd = makeFormData({ id: existingNoteId, title: '更新', content: '更新内容' });

    const result = await updateNoteAction(INITIAL_STATE, fd);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('バリデーション失敗（空タイトル）→ エラーを返却', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
    const fd = makeFormData({ id: existingNoteId, title: '', content: '内容' });

    const result = await updateNoteAction(INITIAL_STATE, fd);

    expect(result.success).toBe(false);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('成功 → redirect("/notes/:id") を呼び出す', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
    const fd = makeFormData({ id: existingNoteId, title: '更新タイトル', content: '更新内容' });

    const result = await updateNoteAction(INITIAL_STATE, fd);

    expect(result.success).toBe(true);
    expect(mockRedirect).toHaveBeenCalledWith(`/notes/${existingNoteId}`);
  });

  it('FormData から id / title / content を正しく取得する', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });
    const fd = makeFormData({ id: existingNoteId, title: '正確な更新', content: '正確な内容' });

    await updateNoteAction(INITIAL_STATE, fd);

    const updated = await repo.getNoteById(existingNoteId);
    expect(updated?.title).toBe('正確な更新');
    expect(updated?.content).toBe('正確な内容');
  });
});

describe('deleteNoteAction', () => {
  let repo: InMemoryNotesRepository;
  let existingNoteId: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    repo = new InMemoryNotesRepository();
    const note = await repo.createNote({ title: '削除対象', content: '内容' });
    existingNoteId = note.id;
    mockGetRepository.mockResolvedValue(repo);
  });

  it('未認証 → auth エラーを返却', async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const result = await deleteNoteAction(existingNoteId);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });

  it('成功 → { success: true, noteId } を返却（redirect なし）', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });

    const result = await deleteNoteAction(existingNoteId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.noteId).toBe(existingNoteId);
    }
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('成功後にリポジトリからノートが削除される', async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 'user-1' });

    await deleteNoteAction(existingNoteId);

    const deleted = await repo.getNoteById(existingNoteId);
    expect(deleted).toBeNull();
  });
});
