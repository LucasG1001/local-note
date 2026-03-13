import { useNotes } from '../context/NoteContext';
import styles from './NoteDetail.module.css';
import NoteContent from './NoteContent';
import NoteHeader from './NoteHeader';

export const NoteDetail = () => {
  const { activeNote } = useNotes();
  if (!activeNote) return null;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <NoteHeader />
        <div className={styles.body}>
          <NoteContent />
        </div>
      </div>
    </div>
  );
};
