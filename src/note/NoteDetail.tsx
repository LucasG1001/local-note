import { useNotes } from '../context/NoteContext';
import styles from './NoteDetail.module.css';
import NoteContent from './NoteContent';
import NoteHeader from './NoteHeader';

export const NoteDetail = () => {
  const { activeNote, setActiveNote } = useNotes();
  if (!activeNote) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={() => setActiveNote(null)} />

      <div className={styles.modal}>
        <NoteHeader />
        <div className={styles.body}>
          <NoteContent />
        </div>
      </div>
    </div>
  );
};
