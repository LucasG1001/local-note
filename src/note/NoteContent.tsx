import { useEffect } from 'react';
import { useNotes } from '../context/NoteContext';
import styles from './NoteContent.module.css';
import NoteBlock from './NoteBlock';

const NoteContent = () => {
  const { activeNote, setActiveNote } = useNotes();

  useEffect(() => {
    if (activeNote && activeNote.content.length === 0) {
      setActiveNote({
        ...activeNote,
        content: [
          {
            id: crypto.randomUUID(),
            type: 'text',
            language: 'javascript',
            value: '',
          },
        ],
      });
    }
  }, [activeNote, setActiveNote]);

  if (!activeNote) {
    return <div className={styles.empty}>Selecione uma nota</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h3 className={styles.sectionTitle}>INFORMAÇÃO SALVA</h3>
      </header>

      <div className={styles.noteContent}>
        {activeNote.content.map((block) => (
          <NoteBlock key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
};

export default NoteContent;
