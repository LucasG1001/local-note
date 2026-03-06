'use client';
import { useEffect, useState } from 'react';
import { useNotes } from '../context/NoteContext';
import styles from './NoteManager.module.css';
import FileExplorer from '../components/FileExplorer/FileExplorer';
import { normalizedMockData } from '../components/FileExplorer/types';
import NoteContent from './noteContent/NoteContent';

export default function NoteManager() {
  const { notes, activeNote, setActiveNote } = useNotes();

  useEffect(() => {
    if (notes.length > 0 && !activeNote) {
      setActiveNote(notes[0]);
    }
  }, [notes, activeNote, setActiveNote]);

  console.log(normalizedMockData.nodes[13]);

  return (
    <div className={styles.container}>
      <FileExplorer />
      <NoteContent note={normalizedMockData.nodes[13]} />
    </div>
  );
}
