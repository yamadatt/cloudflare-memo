import { notFound } from 'next/navigation';
import { getNoteById } from '@/lib/db';
import NoteForm from '@/components/NoteForm';
import { updateNoteAction } from '@/lib/actions';

export const dynamic = 'force-dynamic';

interface EditNotePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditNotePage({ params }: EditNotePageProps) {
  const { id } = await params;
  const note = await getNoteById(id);

  if (!note) {
    notFound();
  }

  return (
    <div className="py-4">
      <NoteForm
        action={updateNoteAction}
        initialTitle={note.title}
        initialContent={note.content}
        cancelHref={`/notes/${note.id}`}
        submitLabel="更新"
        noteId={note.id}
      />
    </div>
  );
}
