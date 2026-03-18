import styles from "./NoteHeader.module.css";
import { useNotes } from "../context/NoteContext";
import { FileText, X } from "lucide-react";

const NoteHeader = () => {
  const { activeNote, updateActiveNote, setActiveNote } = useNotes();
  if (!activeNote) return null;

  return (
    <div className={styles.header}>
      <div className={styles.headerInfo}>
        <div className={styles.iconContainer}>
          <FileText size={20} />
        </div>
        <input
          type="text"
          className={styles.title}
          value={activeNote.title}
          spellCheck="false"
          placeholder="Título da nota..."
          onChange={(e) => updateActiveNote({ title: e.target.value })}
        />
      </div>
      <button
        onClick={() => setActiveNote(null)}
        className={styles.closeButton}
        title="Fechar nota"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default NoteHeader;
