import { useNoteEditor } from '../hooks/useNoteEditor';
import styles from './NoteContent.module.css';
import NoteBlock from './NoteBlock';
import { Note } from './types';

interface NoteContentProps {
  note?: Note;
  readOnly?: boolean;
}

const NoteContent = ({ note, readOnly = false }: NoteContentProps) => {
  const editor = useNoteEditor();
  const displayNote = note || editor.activeNote;

  if (!displayNote) {
    return (
      <div className={styles.empty}>
        <p>Selecione uma nota para começar a editar</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.noteContent}>
        {displayNote.content.map((block) => (
          <NoteBlock key={block.id} block={block} readOnly={readOnly} />
        ))}
      </div>
    </div>
  );
};

export default NoteContent;
