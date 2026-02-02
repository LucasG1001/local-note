import { getNotes, NoteResponseDTO } from './actions/NoteActions';
import '@fontsource/inter';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import NoteManager from './note/noteManeger/NoteManager';
import { NoteProvider } from './context/NoteContext';

export default async function Home() {
  return (
    <NoteProvider>
      <NoteManager />
    </NoteProvider>
  );
}
