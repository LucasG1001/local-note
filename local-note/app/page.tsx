import { getNotes, NoteResponseDTO } from './actions/NoteActions';
import '@fontsource/inter'; // Peso padrão (400)
import '@fontsource/inter/500.css'; // Peso médio
import '@fontsource/inter/700.css'; // Negrito
import '@fontsource/roboto/300.css'; // Light
import '@fontsource/roboto/400.css'; // Regular
import '@fontsource/roboto/500.css'; // Medium
import '@fontsource/roboto/700.css'; // Bold
import NoteManager from './note/NoteManager';
import { NoteProvider } from './context/NoteContext';

export default async function Home() {
  return (
    <NoteProvider>
      <NoteManager />
    </NoteProvider>
  );
}
