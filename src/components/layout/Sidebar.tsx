import { Plus, Github } from 'lucide-react';
import { useNotes } from '../../context/NoteContext';
import styles from './Sidebar.module.css';

const emptyNote = {
  title: "Nova nota",
  content: "",
};

export default function Sidebar() {
  const { saveNote } = useNotes();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>L</div>
          <span className={styles.userName}>Lucas's Notes</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.actionBtn}
          onClick={async () => {
            await saveNote(emptyNote);
          }}
        >
          <Plus size={16} />
          <span>Nova nota</span>
        </button>
      </div>

      <div className={styles.footer}>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.actionBtn}
        >
          <Github size={16} />
          <span>GitHub</span>
        </a>
      </div>
    </aside>
  );
}
