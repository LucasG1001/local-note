import React, { useState } from 'react';
import styles from './NoteHeader.module.css';
import { useNotes } from '../context/NoteContext';
import Tags from '../components/Tags';
import { Terminal, X } from 'lucide-react';

const NoteHeader = () => {
  const { activeNote, setActiveNote } = useNotes();
  const [tag, setTag] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tag.trim() !== '') {
      if (!activeNote) return;
      const updatedTags = [...activeNote.tags, tag.trim()];
      setActiveNote({ ...activeNote, tags: updatedTags });
      setTag('');
    }
  };

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
      <div>
        <input
          type="text"
          onKeyDown={handleKeyDown}
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className={styles.tagInput}
          placeholder="Adicionar tag (Enter)"
        />
        <Tags tags={activeNote.tags} />
      </div>
    </div>
  );
};

export default NoteHeader;
