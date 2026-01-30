import { getNotes, NoteResponseDTO } from './actions/NoteActions';
import Note from './note/Note';
import '@fontsource/inter'; // Peso padrão (400)
import '@fontsource/inter/500.css'; // Peso médio
import '@fontsource/inter/700.css'; // Negrito

export default async function Home() {
  const notes: NoteResponseDTO[] = await getNotes();

  return (
    <div>
      <Note initialNotes={notes} />
    </div>
  );
}
