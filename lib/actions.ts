'use server';

import { redirect } from 'next/navigation';
import { getRepository } from './db';
import { createNoteService, updateNoteService, deleteNoteService } from './note-service';
import type { ActionResult } from './types';

// ノート作成アクション（useActionState 対応シグネチャ）
export async function createNoteAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const title = (formData.get('title') as string) ?? '';
  const content = (formData.get('content') as string) ?? '';

  const repo = await getRepository();
  const result = await createNoteService(repo, title, content);

  if (!result.success) {
    return result;
  }

  redirect('/');
  return result;
}

// ノート更新アクション（useActionState 対応シグネチャ）
export async function updateNoteAction(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const id = (formData.get('id') as string) ?? '';
  const title = (formData.get('title') as string) ?? '';
  const content = (formData.get('content') as string) ?? '';

  const repo = await getRepository();
  const result = await updateNoteService(repo, id, title, content);

  if (!result.success) {
    return result;
  }

  redirect(`/notes/${id}`);
  return result;
}

// ノート削除アクション
export async function deleteNoteAction(id: string): Promise<ActionResult> {
  const repo = await getRepository();
  const result = await deleteNoteService(repo, id);

  if (!result.success) {
    return result;
  }

  redirect('/');
  return result;
}
