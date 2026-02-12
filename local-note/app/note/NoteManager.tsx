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
import { Note } from "../types/note";
import ConfirmationModal from "../components/modal/ConfirmationModal";

const emptyNote: Note = {
  id: crypto.randomUUID(),
  titulo: "",
  tags: [],
  content: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default function NoteManager() {
  const { notes, selectedNote, setSelectedNoteId, addNote, deleteNote } =
    useNotes();
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

  const allUniqueTags = useMemo(() => {
    const tags = notes.flatMap((note) => note.tags);
    return Array.from(new Set(tags));
  }, [notes]);

  const { filteredNotes, isNotFound } = useMemo(() => {
    if (!searchTerm.trim()) return { filteredNotes: notes, isNotFound: false };

    const fuse = new Fuse(notes, {
      keys: ["titulo", "tags"],
      threshold: 0.3,
    });

    const searchTerms = searchTerm.split(" ").filter((term) => term.length > 0);
    const results = searchTerms.map((term) => fuse.search(term));

    if (results.length === 0) {
      return { filteredNotes: notes, isNotFound: true };
    }

    return { filteredNotes: results.map((r) => r[0].item), isNotFound: false };
  }, [notes, searchTerm]);

  if (!filteredNotes) return null;

  return (
    <div className={styles.container}>
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        suggestions={allUniqueTags}
      />

      {isNotFound && (
        <div className={styles.warning}>
          {`⚠️ Nenhuma nota exata para "${searchTerm}". Mostrando todas.`}
        </div>
      )}

      <div className={styles.grid}>
        <button onClick={() => addNote(emptyNote)}>Adicionar nota</button>

        {filteredNotes.map((item) => (
          <div
            onClick={() => setSelectedNoteId(item.id)}
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

      {selectedNote && <NoteDetail />}
    </div>
  );
}
