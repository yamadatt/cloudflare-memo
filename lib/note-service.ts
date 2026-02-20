import { validateNoteInput } from './validations';
import type { INotesRepository } from './repository';
import type { ActionResult } from './types';

// ノート作成サービス（redirect不要、テスト可能）
export async function createNoteService(
  repo: INotesRepository,
  title: string,
  content: string
): Promise<ActionResult> {
  const validation = validateNoteInput(title, content);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors.title ?? 'バリデーションエラーが発生しました',
    };
  }

  try {
    const note = await repo.createNote({ title: title.trim(), content });
    return { success: true, noteId: note.id };
  } catch (error) {
    console.error('[createNoteService]', {
      message: error instanceof Error ? error.message : '不明なエラー',
      timestamp: new Date().toISOString(),
      context: { title },
    });
    return {
      success: false,
      error: 'データの保存中にエラーが発生しました。しばらくしてから再度お試しください。',
    };
  }
}

// ノート更新サービス（redirect不要、テスト可能）
export async function updateNoteService(
  repo: INotesRepository,
  id: string,
  title: string,
  content: string
): Promise<ActionResult> {
  const validation = validateNoteInput(title, content);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors.title ?? 'バリデーションエラーが発生しました',
    };
  }

  try {
    await repo.updateNote({ id, title: title.trim(), content });
    return { success: true, noteId: id };
  } catch (error) {
    console.error('[updateNoteService]', {
      message: error instanceof Error ? error.message : '不明なエラー',
      timestamp: new Date().toISOString(),
      context: { id, title },
    });
    return {
      success: false,
      error: 'データの更新中にエラーが発生しました。しばらくしてから再度お試しください。',
    };
  }
}

// ノート削除サービス（redirect不要、テスト可能）
export async function deleteNoteService(
  repo: INotesRepository,
  id: string
): Promise<ActionResult> {
  try {
    await repo.deleteNote(id);
    return { success: true, noteId: id };
  } catch (error) {
    console.error('[deleteNoteService]', {
      message: error instanceof Error ? error.message : '不明なエラー',
      timestamp: new Date().toISOString(),
      context: { id },
    });
    return {
      success: false,
      error: 'データの削除中にエラーが発生しました。しばらくしてから再度お試しください。',
    };
  }
}
