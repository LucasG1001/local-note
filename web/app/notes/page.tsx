import { getFolders } from '../actions/folders/folderActions';
import { getNotes } from '../actions/notes/notesActions';
import Folder from '../components/folder/Folder';
import Note from '../components/note/Note';
export default async function NotesPage() {
  const notes = await getNotes();
  const folders = await getFolders();

  return (
    <main className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Minhas Notas</h1>
      <Folder folders={folders} />
      <Note initialNotes={notes} />
    </main>
  );
}
