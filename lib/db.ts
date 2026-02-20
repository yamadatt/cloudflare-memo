import { createClient } from '@supabase/supabase-js';
import type { Note } from './types';
import { SupabaseNotesRepository, type INotesRepository } from './repository';
import { getSupabaseRuntimeEnv } from './env';

// リポジトリインスタンスを取得するファクトリ
export async function getRepository(): Promise<INotesRepository> {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = await getSupabaseRuntimeEnv();
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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
