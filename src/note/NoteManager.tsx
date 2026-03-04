'use client';
import { useEffect, useState } from 'react';
import { useNotes } from '../context/NoteContext';
import styles from './NoteManager.module.css';
import FileExplorer from '../components/FileExplorer/FileExplorer';
import NoteContent from './NoteContent';
import { normalizedMockData } from '../components/FileExplorer/types';

export default function NoteManager() {
  const { notes, activeNote, setActiveNote } = useNotes();

  useEffect(() => {
    if (notes.length > 0 && !activeNote) {
      setActiveNote(notes[0]);
    }
  }, [notes, activeNote, setActiveNote]);
  return (
    <div className={styles.container}>
      <FileExplorer />
      <NoteContent note={normalizedMockData.nodes[13]} />
    </div>
  );
}
