import { X, Terminal } from 'lucide-react';

import { useState } from 'react';
import { useNotes } from '../context/NoteContext';
import styles from './NoteDetail.module.css';
import NoteContent from './NoteContent';
import Tags from '../components/Tags';

export const NoteDetail = () => {
  const { activeNote, setActiveNote } = useNotes();
  if (!activeNote) return null;
  const [tag, setTag] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tag.trim() !== '') {
      if (!activeNote.tags) activeNote.tags = [];
      activeNote.tags.push(tag.trim());
      setActiveNote(activeNote);
      setTag('');
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={() => setActiveNote(null)} />

      <div className={styles.modal}>
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
        <div className={styles.tags}>
          <Tags tags={activeNote.tags || []} />
          <input
            type="text"
            value={tag}
            onKeyDown={handleKeyDown}
            onChange={(e) => setTag(e.target.value)}
            placeholder="Adicionar tag e pressionar Enter"
            className={styles.tagInput}
          />
        </div>

        <div className={styles.body}>
          <NoteContent />
        </div>
      </div>
    </div>
  );
};
