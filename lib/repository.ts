import { type SupabaseClient } from '@supabase/supabase-js';
import type { Note, CreateNoteInput, UpdateNoteInput } from './types';

// D1データベースのレコード形式（スネークケース）
export interface NoteRecord {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// NoteRecordをNoteに変換
export function toNote(record: NoteRecord): Note {
  return {
    id: record.id,
    title: record.title,
    content: record.content,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

// リポジトリインターフェース（DI用）
export interface INotesRepository {
  getAllNotes(): Promise<Note[]>;
  getNoteById(id: string): Promise<Note | null>;
  createNote(input: CreateNoteInput): Promise<Note>;
  updateNote(input: UpdateNoteInput): Promise<Note>;
  deleteNote(id: string): Promise<void>;
}

// D1を使った実装（D1利用時のロールバック用に保持）
export class D1NotesRepository implements INotesRepository {
  constructor(private db: D1Database) {}

  async getAllNotes(): Promise<Note[]> {
    const result = await this.db
      .prepare('SELECT * FROM notes ORDER BY created_at DESC')
      .all<NoteRecord>();
    return result.results.map(toNote);
  }

  async getNoteById(id: string): Promise<Note | null> {
    const result = await this.db
      .prepare('SELECT * FROM notes WHERE id = ?')
      .bind(id)
      .first<NoteRecord>();
    if (!result) return null;
    return toNote(result);
  }

  async createNote(input: CreateNoteInput): Promise<Note> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db
      .prepare(
        'INSERT INTO notes (id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(id, input.title, input.content, now, now)
      .run();

    return {
      id,
      title: input.title,
      content: input.content,
      createdAt: now,
      updatedAt: now,
    };
  }

  async updateNote(input: UpdateNoteInput): Promise<Note> {
    const now = new Date().toISOString();

    await this.db
      .prepare(
        'UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?'
      )
      .bind(input.title, input.content, now, input.id)
      .run();

    const updated = await this.getNoteById(input.id);
    if (!updated) {
      throw new Error(`ノートが見つかりませんでした: ${input.id}`);
    }
    return updated;
  }

  async deleteNote(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM notes WHERE id = ?').bind(id).run();
  }
}

// Supabaseを使った本番実装
export class SupabaseNotesRepository implements INotesRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAllNotes(): Promise<Note[]> {
    const { data, error } = await this.supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data as NoteRecord[]).map(toNote);
  }

  async getNoteById(id: string): Promise<Note | null> {
    const { data, error } = await this.supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(error.message);
    }
    return toNote(data as NoteRecord);
  }

  async createNote(input: CreateNoteInput): Promise<Note> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const { error } = await this.supabase.from('notes').insert({
      id,
      title: input.title,
      content: input.content,
      created_at: now,
      updated_at: now,
    });
    if (error) throw new Error(error.message);
    return { id, title: input.title, content: input.content, createdAt: now, updatedAt: now };
  }

  async updateNote(input: UpdateNoteInput): Promise<Note> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('notes')
      .update({ title: input.title, content: input.content, updated_at: now })
      .eq('id', input.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toNote(data as NoteRecord);
  }

  async deleteNote(id: string): Promise<void> {
    const { error } = await this.supabase.from('notes').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}
