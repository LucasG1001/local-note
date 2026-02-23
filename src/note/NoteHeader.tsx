import React, { useState } from 'react';
import styles from './NoteHeader.module.css';
import { useNotes } from '../context/NoteContext';
import Tags from '../components/Tags';
import { Terminal, X } from 'lucide-react';

interface NoteHeaderProps {
  title: string;
}

const NoteHeader = () => {
  const { activeNote, setActiveNote } = useNotes();
  const [tag, setTag] = useState('');

  if (!activeNote) return null;

  return (
    <div className={styles.header}>
      <div className={styles.headerInfo}>
        <div className={styles.iconContainer}>
          <Terminal size={20} />
        </div>
        <input
          type="text"
          className={styles.title}
          value={activeNote.title}
          spellCheck="false"
          onChange={(e) =>
            setActiveNote({ ...activeNote, title: e.target.value })
          }
        />
      </div>
      <button
        onClick={() => setActiveNote(null)}
        className={styles.closeButton}
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default NoteHeader;
