import "@fontsource/inter";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import NoteManager from "./note/NoteManager";
import { NoteProvider } from "./context/NoteContext";
import { getNotesAction } from "./actions/NoteActions";
import { Note } from "./types/note";

export default async function Home() {
  const response = await getNotesAction();
  const initialNotes = response.data || [];

  return (
    <NoteProvider initialNotes={initialNotes}>
      <NoteManager />
    </NoteProvider>
  );
}
