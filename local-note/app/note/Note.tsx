'use client';
import Prism from 'prismjs';
// import 'prismjs/components/prism-javascript'; // ou a linguagem que quiser
// import 'prismjs/components/prism-python';
// import 'prismjs/components/prism-sql';
// import 'prismjs/themes/prism-tomorrow.css';
import React, { useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { Note as NoteType } from '@prisma/client';
import { addSectionToNote, NoteResponseDTO } from '../actions/NoteActions';
import styles from './Note.module.css';
import SearchManager from './SearchManager';

const Note = ({ initialNotes }: { initialNotes: NoteResponseDTO[] }) => {
  const [notes, setNotes] = React.useState(initialNotes);
  const [currentNote, setCurrentNote] = React.useState<NoteResponseDTO>(
    initialNotes[0],
  );
  const [sections, setSections] = React.useState(currentNote.sections);

  function detectLanguage(code: string) {
    const trimmed = code.trim();

    if (/select|from|where|insert|update|delete/i.test(trimmed)) return 'sql';
    if (/def |import |print\(|:\s*$/i.test(trimmed)) return 'python';
    if (/const |let |function |=>/i.test(trimmed)) return 'javascript';

    return 'normal';
  }

  const handleChange = ({ value, id }: { value: string; id: string }) => {
    const updatedSections = sections.map((section) =>
      section.id === id ? { ...section, text: value } : section,
    );
    setSections(updatedSections);
  };

  const onKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      const updatedSections = await addSectionToNote(currentNote.id, {
        text: '',
        type: 'text',
      });
      setSections(updatedSections);
    }
  };

  return (
    <div className={styles.content}>
      <SearchManager />
      {/* {sections.map((item, index) => (
          <div key={item.id} className="editor-wrapper" id={`${item.id}`}>
            <Editor
              value={item.text}
              onValueChange={(code) =>
                handleChange({ value: code, id: item.id })
              }
              highlight={(code) => {
                if (item.type === "text") return code;
                const lang = detectLanguage(code);
                if (lang === "normal") return code;
                return Prism.highlight(code, Prism.languages[lang], lang);
              }}
              padding={10}
              className={`${styles.editor} ${styles[item.type]}`}
              onKeyDown={onKeyDown}
            />
          </div>
        ))} */}
    </div>
  );
};

export default Note;
