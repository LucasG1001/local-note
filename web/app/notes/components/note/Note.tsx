"use client";

import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/themes/prism-tomorrow.css";
import React, { ChangeEvent, useRef, useState } from "react";
import Editor from "react-simple-code-editor";
import styles from "./Note.module.css";

import Button from "@/app/components/button/Button";
import {
  faArrowDown,
  faArrowUp,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

interface Note {
  id: string;
  views: number;
  title: string;
  content: string;
  language: string;
  folderId: string;
}

interface NoteProps {
  initialNotes: Note[];
}

export default function Note({ initialNotes = [] }: NoteProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<string>("text");
  const [folderId, setFolderId] = useState<string>("");
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

  const filteredNotes = React.useMemo(() => {
    if (!folderId) return notes;
    return notes.filter((note) => note.folderId === folderId);
  }, [notes, folderId]);

  const handleCreate = async () => {
    const newNote = await createNote(folderId);
    setNotes((prevNotes) => [newNote, ...prevNotes]);
  };

  const handleSelectNote = async (id: string) => {
    const isAlreadySelected = selectedNoteId === id;
    setSelectedNoteId(isAlreadySelected ? null : id);

    if (!isAlreadySelected) {
      await incrementView(id);
      setNotes((prevNotes) =>
        prevNotes
          .map((note) =>
            note.id === id ? { ...note, views: note.views + 1 } : note
          )
          .sort((a, b) => b.views - a.views)
      );
    }
  };

  const handleDelete = async (id: string) => {
    await deleteNote(id);
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  const handleUpdate = (id: string, updatedFields: Partial<Note>) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, ...updatedFields } : note
      )
    );

    if (updateTimerRef.current) clearTimeout(updateTimerRef.current);

    updateTimerRef.current = setTimeout(async () => {
      await updateNote(id, updatedFields);
    }, 5000);
  };

  const handleFilter = (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
  };

  const handleLanguageChange = (id: string, language: string) => {
    setActiveLanguage(language);
    handleUpdate(id, { language });
  };

  const renderLanguageOptions = () =>
    Object.keys(Prism.languages).map((langKey) => (
      <option key={langKey} value={langKey}>
        {langKey}
      </option>
    ));

  return (
    <div className={styles.note}>
      <div>
        <div className={styles.noteActions}>
          <button className={styles.noteButton} onClick={handleCreate}>
            +
          </button>
          <input
            className={styles.noteFilter}
            type="text"
            placeholder="Filtrar por título"
            onChange={handleFilter}
          />
        </div>

        {filteredNotes.map((note) => {
          const isSelected = selectedNoteId === note.id;

          return (
            <div key={note.id} className={styles.noteItem}>
              <div className={styles.noteHeader}>
                <input
                  type="text"
                  value={note.title}
                  onChange={(e) =>
                    handleUpdate(note.id, { title: e.target.value })
                  }
                />

                {isSelected ? (
                  <Button text="" variant="collapse" icon={faArrowUp} />
                ) : (
                  <Button text="" variant="collapse" icon={faArrowDown} />
                )}
                <Button
                  text="Excluir"
                  variant="delete"
                  onClick={() => handleDelete(note.id)}
                  icon={faTrash}
                />
              </div>

              {isSelected && (
                <div className={styles.noteContent}>
                  <Editor
                    className={styles.textarea}
                    id={note.id}
                    value={note.content}
                    onValueChange={(code) =>
                      handleUpdate(note.id, { content: code })
                    }
                    highlight={(code) =>
                      note.language === "none"
                        ? code
                        : Prism.highlight(
                            code,
                            Prism.languages[note.language],
                            note.language
                          )
                    }
                    padding={20}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
