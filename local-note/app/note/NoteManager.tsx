"use client";
import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import Tags from "./Tags";
import { useNotes } from "../context/NoteContext";
import styles from "./NoteManager.module.css";
import { NoteDetail } from "./NoteDetail";
import SearchBar from "../components/SearchBar/SearchBar";
import AutoResizableTextarea from "../components/AutoResizableTextarea/AutoResizableTextarea";
import { CodeBlock } from "./CodeBlock";
import { NewNote, Note } from "../types/note";
import ConfirmationModal from "../components/modal/ConfirmationModal";

const emptyNote: NewNote = {
  titulo: "",
  tags: [],
  content: [],
};

export default function NoteManager() {
  const { notes, saveNote, deleteNote, activeNote, setActiveNote } = useNotes();
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteIdToDelete, setNoteToDelete] = useState<Note | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    setNoteToDelete(note);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (noteIdToDelete) {
      deleteNote(noteIdToDelete.id);
      setIsModalOpen(false);
      setNoteToDelete(null);
    }
  };

  return (
    <div className={styles.container}>
      {/* <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        suggestions={allUniqueTags}
      /> */}

      <div className={styles.grid}>
        <button onClick={() => saveNote(emptyNote)}>Adicionar nota</button>

        {!notes && (
          <div className={styles.empty}>Nenhuma nota criada ainda</div>
        )}

        {notes &&
          notes.map((item) => (
            <div
              onClick={() => setActiveNote(item)}
              key={item.id}
              className={styles.card}
            >
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{item.titulo}</h3>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => handleDeleteClick(e, item)}
                >
                  DELETE
                </button>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardContent}>
                  {item.content.map((block) => {
                    return (
                      <div key={block.id} className={styles.blockWrapper}>
                        {block.type === "text" ? (
                          <AutoResizableTextarea
                            value={block.value}
                            onChange={() => {}}
                          />
                        ) : (
                          <CodeBlock
                            value={block.value}
                            language={block.language || "javascript"}
                            onChange={() => {}}
                            editable={false}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <Tags item={item} />
              </div>
            </div>
          ))}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={` Deletar nota "${noteIdToDelete?.titulo}" `}
        message="Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita."
      />

      {activeNote && <NoteDetail />}
    </div>
  );
}
