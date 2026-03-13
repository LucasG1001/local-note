"use client";
import { useState } from "react";
import { useNotes } from "../context/NoteContext";
import styles from "./NoteManager.module.css";
import { Note } from "./types";
import ConfirmationModal from "../components/modal/ConfirmationModal";
import NoteContent from "./NoteContent";
import SearchBar from "../components/SearchBar";
import { NoteDetail } from "./NoteDetail";
import Tags from "../components/Tags";

export default function NoteManager() {
  const {
    notes,
    deleteNote,
    activeNote,
    setActiveNote,
    setSelectedTags,
    tags,
  } = useNotes();
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteIdToDelete, setNoteToDelete] = useState<Note | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    setNoteToDelete(note);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (noteIdToDelete?.id) {
      deleteNote(noteIdToDelete.id);
      setIsModalOpen(false);
      setNoteToDelete(null);
    }
  };

  // If there's an active note, we show the full-page note details.
  if (activeNote) {
    return <NoteDetail />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Todas as Notas</h1>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          suggestions={tags}
          setSelectedTags={setSelectedTags}
        />
      </div>

      <div className={styles.noteList}>
        {notes &&
          notes.map((item) => (
            <div key={item.id} className={styles.card} onClick={() => setActiveNote(item)}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <Tags tags={item.tags} editable={false} />
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => handleDeleteClick(e, item)}
                >
                  Excluir
                </button>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardBody}>
                  {/* Read-only preview */}
                  <div className={styles.preview}>
                    {item.content.length > 0 && item.content[0].type === 'text'
                      ? item.content[0].value
                      : (item.content.length > 0 ? "Código..." : "Nota vazia...")}
                  </div>
                </div>
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
        title={` Deletar nota "${noteIdToDelete?.title}" `}
        message="Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
