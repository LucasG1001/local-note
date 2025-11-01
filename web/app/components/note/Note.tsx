'use client';

import React, { useEffect, useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import styles from './Note.module.css';
import {
  createNote,
  updateNote,
  deleteNote,
  incrementView,
} from '../../actions/notes/notesActions';

interface NoteProps {
  id: string;
  views: number;
  title: string;
  content: string;
  language: string;
}

interface NoteComponentProps {
  initialNotes: NoteProps[];
}

export default function Note({ initialNotes }: NoteComponentProps) {
  const [notes, setNotes] = useState<NoteProps[]>(initialNotes);
  const [filtered, setFiltered] = useState<NoteProps[]>(initialNotes);
  const [lang, setLang] = useState<string>('text');
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  useEffect(() => {
    setFiltered(notes);
  }, [notes]);

  const handleCreate = async () => {
    const newNote = await createNote();
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleSelect = async (id: string) => {
    if (selectedNote === id) {
      setSelectedNote(null);
      return;
    }
    setSelectedNote(id);
    await incrementView(id);
    setNotes((prev) =>
      prev
        .map((n) => (n.id === id ? { ...n, views: n.views + 1 } : n))
        .sort((a, b) => b.views - a.views),
    );
  };

  const handleDelete = async (id: string) => {
    await deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleUpdate = async (id: string, data: Partial<NoteProps>) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...data } : n)));
    // debounce local de 5s antes de salvar no backend
    clearTimeout((window as any)._updateTimer);
    (window as any)._updateTimer = setTimeout(async () => {
      await updateNote(id, data);
    }, 5000);
  };

  const handleFilter = (title: string) => {
    const filteredNotes = notes.filter((n) =>
      n.title.toLowerCase().includes(title.toLowerCase()),
    );
    setFiltered(filteredNotes);
  };

  const handleSetLanguage = (id: string, language: string) => {
    setLang(language);
    handleUpdate(id, { language });
  };

  return (
    <div className={styles.note}>
      <div className={styles.noteActions}>
        <button className={styles.noteButton} onClick={handleCreate}>
          Nova
        </button>
        <input
          className={styles.noteFilter}
          type="text"
          placeholder="Filtrar por título"
          onChange={(e) => handleFilter(e.target.value)}
        />
      </div>

      {filtered.map((n) => (
        <div key={n.id} className={styles.noteItem}>
          <div className={styles.noteHeader}>
            <input
              type="text"
              value={n.title}
              onChange={(e) => handleUpdate(n.id, { title: e.target.value })}
            />
            <select
              onChange={(e) => handleSetLanguage(n.id, e.target.value)}
              value={n.language}
            >
              {Object.keys(Prism.languages).map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleSelect(n.id)}
              className={styles.noteButtonSelect}
            >
              ^
            </button>

            <button
              className={styles.noteButtonDelete}
              onClick={() => handleDelete(n.id)}
            >
              Delete
            </button>
          </div>

          {selectedNote === n.id && (
            <Editor
              className={styles.textarea}
              value={n.content}
              onValueChange={(code) => handleUpdate(n.id, { content: code })}
              highlight={(code) =>
                n.language === 'none'
                  ? code
                  : Prism.highlight(
                      code,
                      Prism.languages[n.language],
                      n.language,
                    )
              }
              padding={20}
            />
          )}
        </div>
      ))}
    </div>
  );
}
