import React, { useRef, useEffect, useState } from 'react';
import styles from './NoteContent.module.css';
import { useNotes } from '@/app/context/NoteContext';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';

const NoteContent = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedNote, updateNote } = useNotes();
  const [content, setContent] = useState(selectedNote?.content || '');

  const isPending = selectedNote && content !== selectedNote.content;

  useEffect(() => {
    if (!isPending || !selectedNote) return;

    const timer = setTimeout(() => {
      updateNote(selectedNote.id, { content });
      console.log('Nota salva no backend!');
    }, 10000);

    return () => clearTimeout(timer);
  }, [content, isPending, selectedNote, updateNote]);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [content]);

  if (!selectedNote) {
    return <div className={styles.empty}>Selecione uma nota</div>;
  }

  return (
    <div className={styles.container}>
      <textarea
        ref={textareaRef}
        className={styles.noteInput}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={1}
        spellCheck="false"
      />

      <Editor
        value={content}
        onValueChange={setContent}
        highlight={(code) => highlight(code, languages.js, 'javascript')}
        className={styles.noteInput}
      />
    </div>
  );
};

export default NoteContent;
