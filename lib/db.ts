import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { Note } from './types';
import { D1NotesRepository, type INotesRepository } from './repository';

// リポジトリインスタンスを取得するファクトリ
export async function getRepository(): Promise<INotesRepository> {
  const ctx = await getCloudflareContext({ async: true });
  return new D1NotesRepository(ctx.env.DB);
}

// ページが使う便利関数（互換性維持）
export async function getAllNotes(): Promise<Note[]> {
  const repo = await getRepository();
  return repo.getAllNotes();
}

export async function getNoteById(id: string): Promise<Note | null> {
  const repo = await getRepository();
  return repo.getNoteById(id);
}
