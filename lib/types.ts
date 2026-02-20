export interface Note {
  id: string;        // UUID v4形式の一意識別子
  title: string;     // ノートのタイトル（必須、1文字以上）
  content: string;   // ノートの本文（空文字列可）
  createdAt: string; // ISO 8601形式のタイムスタンプ
  updatedAt: string; // ISO 8601形式のタイムスタンプ
}

export interface CreateNoteInput {
  title: string;   // 1文字以上の文字列
  content: string; // 任意の文字列
}

export interface UpdateNoteInput {
  id: string;      // 更新対象のノートID
  title: string;   // 1文字以上の文字列
  content: string; // 任意の文字列
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: { title?: string; content?: string } };

export type ActionResult =
  | { success: true; noteId: string }
  | { success: false; error: string };
