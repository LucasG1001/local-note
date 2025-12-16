import { getNotes, NoteResponseDTO } from "./actions/NoteActions";
import Note from "./note/Note";

export default async function Home() {
  const notes: NoteResponseDTO[] = await getNotes();

  return (
    <div>
      <Note initialNotes={notes} />
    </div>
  );
}
