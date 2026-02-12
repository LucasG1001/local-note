import { X, Terminal } from 'lucide-react';
import styles from './NoteDetail.module.css';
import { useNotes } from '@/app/context/NoteContext';
import NoteContent from './NoteContent';

export const NoteDetail = () => {
  const { selectedNote, setSelectedNoteId } = useNotes();

  if (!selectedNote) return null;

  return (
    <div className={styles.overlay}>
      <div
        className={styles.backdrop}
        onClick={() => setSelectedNoteId(null)}
      />

      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.iconContainer}>
              <Terminal size={20} />
            </div>
            <div>
              <h2 className={styles.title}>{selectedNote.titulo}</h2>
            </div>
          </div>
          <button
            onClick={() => setSelectedNoteId(null)}
            className={styles.closeButton}
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.bodyHeader}></div>

          <NoteContent key={selectedNote.id} />
        </div>
      </div>
    </div>
  );
};
