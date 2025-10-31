import { getNotes } from "../actions/notes/notesActions";
import Note from "../components/note/Note";
export default async function NotesPage() {
  const notes = await getNotes();
  return (
    <main className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Minhas Notas</h1>
      <Note initialNotes={notes} />
    </main>
  );
}
