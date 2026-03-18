import { useNotes } from '../context/NoteContext';
import styles from './NoteContent.module.css';
import Editor from './editor/Editor';

const NoteContent = () => {
  const { activeNote, updateActiveNote } = useNotes();

  if (!activeNote) {
    return (
      <div className={styles.empty}>
        <p>Selecione uma nota para começar a editar</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Editor
        value={activeNote.content}
        onChange={(content) => updateActiveNote({ content })}
        placeholder="Escreva sua nota aqui..."
      />
      <p>{activeNote.ai_description}</p>
    </div>
  );
};

export default NoteContent;
