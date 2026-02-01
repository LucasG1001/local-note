import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Terminal } from 'lucide-react';
import Tags from './Tags';
import NoteContent from './noteContent/NoteContent';
import styles from './NoteDetail.module.css';
import { useNotes } from '../context/NoteContext';

export const NoteDetail = () => {
  const [copied, setCopied] = useState(false);
  const { selectNote, selectedNote, updateNote } = useNotes();

  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 2000);
    }
  }, [copied]);

  if (selectedNote === null) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedNote.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={() => selectNote(null)} />

      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.iconContainer}>
              <Terminal size={20} />
            </div>
            <div>
              <h2 className={styles.title}>{selectedNote.titulo}</h2>
              <span className={styles.category}>{selectedNote.categoria}</span>
            </div>
          </div>
          <button
            onClick={() => selectNote(null)}
            className={styles.closeButton}
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.bodyHeader}>
            <h3 className={styles.sectionTitle}>Informação Salva</h3>
            <button
              onClick={handleCopy}
              className={`${styles.copyButton} ${
                copied ? styles.copyButtonSuccess : styles.copyButtonDefault
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          <NoteContent key={selectedNote.id} />

          {/* <Tags /> */}
        </div>
      </div>
    </div>
  );
};
