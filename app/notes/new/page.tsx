import NoteForm from '@/components/NoteForm';
import { createNoteAction } from '@/lib/actions';

export default function NewNotePage() {
  return (
    <div className="py-4">
      <NoteForm
        action={createNoteAction}
        cancelHref="/"
        submitLabel="作成"
      />
    </div>
  );
}
