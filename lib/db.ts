import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createClient } from '@supabase/supabase-js';
import type { Note } from './types';
import { SupabaseNotesRepository, type INotesRepository } from './repository';

// リポジトリインスタンスを取得するファクトリ
export async function getRepository(): Promise<INotesRepository> {
  const { env } = await getCloudflareContext({ async: true });
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  return new SupabaseNotesRepository(supabase);
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
