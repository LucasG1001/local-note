import { X, Terminal } from "lucide-react";
import styles from "./NoteDetail.module.css";
import { useNotes } from "@/app/context/NoteContext";
import NoteContent from "./NoteContent";

export const NoteDetail = () => {
  const { selectedNote, setSelectedNoteId, updateNote } = useNotes();

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
            <input
              type="text"
              className={styles.title}
              value={selectedNote.titulo}
              spellCheck="false"
              onChange={(e) =>
                updateNote(selectedNote.id, { titulo: e.target.value })
              }
            />
          </div>
          <button
            onClick={() => setSelectedNoteId(null)}
            className={styles.closeButton}
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <NoteContent key={selectedNote.id} />
        </div>
      </div>
    </div>
  );
};
