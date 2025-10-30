"use client";
import React, { useEffect } from "react";
import styles from "./Note.module.css";
import Editor from "react-simple-code-editor";

import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";

interface NoteProps {
  title: string;
  content: string;
}

const notes = [
  {
    title: "First Note",
    content: "This is the content of the first note.",
  },
];

function handleChangeTitle(
  index: number,
  newTitle: string,
  setNote: React.Dispatch<React.SetStateAction<NoteProps[]>>,
  note: NoteProps[]
) {
  const updatedNotes = [...note];
  updatedNotes[index].title = newTitle;
  setNote(updatedNotes);
}

function handleChangeContent(
  index: number,
  newContent: string,
  setNote: React.Dispatch<React.SetStateAction<NoteProps[]>>,
  note: NoteProps[]
) {
  const updatedNotes = [...note];
  updatedNotes[index].content = newContent;
  setNote(updatedNotes);
}

const Note = () => {
  const [note, setNote] = React.useState<NoteProps[]>(notes);
  const [noteFiltered, setNoteFiltered] = React.useState<NoteProps[]>(notes);
  const [code, setCode] = React.useState<string>("");
  const [lang, setLang] = React.useState<string>("sql");
  const [selectedNoteIndex, setSelectedNoteIndex] = React.useState<
    number | null
  >(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setNoteFiltered(note);
  }, [note]);

  function handleNoteSelect(index: number) {
    if (selectedNoteIndex === index) {
      setSelectedNoteIndex(null);
      return;
    }
    setSelectedNoteIndex(index);
  }

  function adjustTextareaHeight() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  function handleFindNoteByTitle(title: string) {
    const notes = note.filter((n) => n.title.includes(title));
    setNoteFiltered(notes);
  }

  React.useEffect(() => {
    adjustTextareaHeight();
  }, [note]);

  return (
    <div className={styles.note}>
      <div className={styles.actions}></div>
      <div className={styles.noteActions}>
        <button
          className={styles.noteButton}
          onClick={() => setNote([...note, { title: "", content: "" }])}
        >
          Novo
        </button>
        <input
          className={styles.noteFilter}
          type="text"
          placeholder="filter by title"
          onChange={(e) => handleFindNoteByTitle(e.target.value)}
        />
      </div>
      {noteFiltered.map((n, index) => (
        <div key={index} className={styles.noteItem}>
          <div className={styles.noteHeader}>
            <input
              type="text"
              onChange={(e) =>
                handleChangeTitle(index, e.target.value, setNote, note)
              }
              value={n.title}
            />
            <select onChange={(e) => setLang(e.target.value)} value={lang}>
              <option value="sql">SQL</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="none">Texto</option>
            </select>
            <button
              onClick={() => handleNoteSelect(index)}
              className={styles.noteButtonSelect}
            >
              ^
            </button>
          </div>
          {selectedNoteIndex === index && (
            <Editor
              className={styles.textarea}
              value={n.content}
              onValueChange={(code) =>
                handleChangeContent(index, code, setNote, note)
              }
              highlight={(code) =>
                lang === "none"
                  ? code
                  : Prism.highlight(code, Prism.languages[lang], lang)
              }
              padding={20}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Note;
