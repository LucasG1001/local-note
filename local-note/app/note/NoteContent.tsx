import React from 'react';
import styles from './NoteContent.module.css';
import NoteBlock from './NoteBlock';
import { useNotes } from '../context/NoteContext';

const NoteContent = () => {
  const { selectedNote } = useNotes();

  if (!selectedNote) {
    return <div className={styles.empty}>Selecione uma nota</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h3 className={styles.sectionTitle}>INFORMAÇÃO SALVA</h3>
      </header>

      <div className={styles.noteContent}>
        {selectedNote.content.map((block) => (
          <NoteBlock key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
};

export default NoteContent;
