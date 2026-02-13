import { X, Terminal } from 'lucide-react';
import styles from './NoteDetail.module.css';
import { useNotes } from '@/app/context/NoteContext';
import NoteContent from './NoteContent';
import Tags from './Tags';
import { useState } from 'react';

export const NoteDetail = () => {
  const { activeNote, setActiveNote } = useNotes();
  const [tag, setTag] = useState('');

  if (!activeNote) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.code === 'Space') {
      setActiveNote({ ...activeNote, tags: [...activeNote.tags, tag] });
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
              value={activeNote.titulo}
              spellCheck="false"
              onChange={(e) =>
                setActiveNote({ ...activeNote, titulo: e.target.value })
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
          <Tags item={activeNote} />
          <input
            type="text"
            value={tag}
            onKeyDown={handleKeyDown}
            onChange={(e) => setTag(e.target.value)}
          />
        </div>

        <div className={styles.body}>
          <NoteContent key={activeNote.id} />
        </div>
      </div>
    </div>
  );
};
