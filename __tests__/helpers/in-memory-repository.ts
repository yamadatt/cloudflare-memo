import type { Note, CreateNoteInput, UpdateNoteInput } from '../../lib/types';
import type { INotesRepository } from '../../lib/repository';

// テスト用インメモリ実装
export class InMemoryNotesRepository implements INotesRepository {
  private store = new Map<string, Note>();

  async getAllNotes(): Promise<Note[]> {
    return Array.from(this.store.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getNoteById(id: string): Promise<Note | null> {
    return this.store.get(id) ?? null;
  }

  async createNote(input: CreateNoteInput): Promise<Note> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const note: Note = {
      id,
      title: input.title,
      content: input.content,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(id, note);
    return note;
  }

  async updateNote(input: UpdateNoteInput): Promise<Note> {
    const existing = this.store.get(input.id);
    if (!existing) {
      throw new Error(`ノートが見つかりませんでした: ${input.id}`);
    }
    const now = new Date().toISOString();
    const updated: Note = {
      ...existing,
      title: input.title,
      content: input.content,
      updatedAt: now,
    };
    this.store.set(input.id, updated);
    return updated;
  }

  async deleteNote(id: string): Promise<void> {
    this.store.delete(id);
  }

  // テスト補助メソッド
  reset(): void {
    this.store.clear();
  }

  seed(notes: Note[]): void {
    for (const note of notes) {
      this.store.set(note.id, note);
    }
  }

  size(): number {
    return this.store.size;
  }
}
