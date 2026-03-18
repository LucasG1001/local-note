import { useState } from "react";
import { useNotes } from "../context/NoteContext";
import styles from "./NoteManager.module.css";
import { Note } from "./types";
import ConfirmationModal from "../components/modal/ConfirmationModal";
import SearchBar from "../components/SearchBar";
import { NoteDetail } from "./NoteDetail";
import { Loader2 } from "lucide-react";

export default function NoteManager() {
  const {
    notes,
    deleteNote,
    activeNote,
    setActiveNote,
    searchNotes,
    loadNotes,
    isPending,
  } = useNotes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    setNoteToDelete(note);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (noteToDelete?.id) {
      deleteNote(noteToDelete.id);
      setIsModalOpen(false);
      setNoteToDelete(null);
    }
  };

  if (activeNote) {
    return <NoteDetail />;
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Notas</h1>
        <SearchBar
          onSearch={searchNotes}
          onClear={loadNotes}
        />
      </div>

      {isPending && (
        <div className={styles.loadingBanner}>
          <Loader2 size={14} className={styles.spinner} />
          <span>Indexando com IA...</span>
        </div>
      )}

      <div className={styles.noteList}>
        {notes.map((item) => (
          <div
            key={item.id}
            className={styles.card}
            onClick={() => setActiveNote(item)}
          >
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                {item.title || "Sem título"}
              </h3>
              <button
                className={styles.deleteBtn}
                onClick={(e) => handleDeleteClick(e, item)}
                title="Deletar nota"
              >
                Excluir
              </button>
            </div>
            <div className={styles.cardContent}>
              <p className={styles.preview}>
                {item.content.length > 0
                  ? item.content.slice(0, 150)
                  : "Nota vazia..."}
              </p>
              <span className={styles.dateLabel}>
                {formatDate(item.updatedAt)}
              </span>
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <div className={styles.emptyState}>
            <p>Nenhuma nota encontrada.</p>
            <p className={styles.emptySub}>Crie uma nova nota na barra lateral.</p>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Deletar nota "${noteToDelete?.title}"`}
        message="Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
