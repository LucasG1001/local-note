'use server';
import { getFolders } from '../actions/folders/folderActions';
import { getNotes } from '../actions/notes/notesActions';
import Note from '../components/note/Note';
export default async function NotesPage() {
  const notes = await getNotes();
  const folders = await getFolders();

  return (
    <main className="p-4">
      <Note initialNotes={notes} folders={folders} />
    </main>
  );
}
