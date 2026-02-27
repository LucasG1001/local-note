"use client";
import { useState } from "react";
import { useNotes } from "../context/NoteContext";
import styles from "./NoteManager.module.css";
import { NewNote, Note } from "./types";
import ConfirmationModal from "../components/modal/ConfirmationModal";
import NoteContent from "./NoteContent";
import SearchBar from "../components/SearchBar";
import { NoteDetail } from "./NoteDetail";
import Tags from "../components/Tags";

const emptyNote: NewNote = {
  title: "Nova nota",
  content: [
    {
      id: crypto.randomUUID(),
      type: "text",
      language: "javascript",
      value: "",
    },
  ],
  tags: [],
};

export default function NoteManager() {
  const {
    notes,
    saveNote,
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
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          suggestions={tags}
          setSelectedTags={setSelectedTags}
        />
        <button className={styles.addBtn} onClick={() => saveNote(emptyNote)}>
          Adicionar nota
        </button>
      </div>

      <div className={styles.noteList}>
        {notes &&
          notes.map((item) => (
            <div key={item.id} className={styles.card}>
              <div
                className={styles.cardHeader}
                onClick={() => setActiveNote(item)}
                style={{ cursor: "pointer" }}
              >
                <div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <Tags tags={item.tags} editable={false} />
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => handleDeleteClick(e, item)}
                >
                  DELETE
                </button>
              </div>
              <div className={styles.cardBody}>
                <NoteContent note={item} />{" "}
              </div>
            </div>
          ))}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={` Deletar nota "${noteIdToDelete?.title}" `}
        message="Tem certeza que deseja excluir esta nota? Esta ação não pode ser desfeita."
      />

      {activeNote && <NoteDetail />}
    </div>
  );
}
