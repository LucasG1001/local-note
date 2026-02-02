'use client';
import React, { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { NoteDetail } from '../NoteDetail';
import Tags from '../Tags';
import SearchBar from '../SearchBar';
import { useNotes } from '../../context/NoteContext';
import styles from './NoteManager.module.css';

export default function NoteManager() {
  const { notes, selectedNote, selectNote } = useNotes();
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Extrair todas as tags únicas existentes nas notas para o autocomplete
  const allUniqueTags = useMemo(() => {
    const tags = notes.flatMap((note) => note.tags);
    return Array.from(new Set(tags));
  }, [notes]);

  const { filteredNotes, isNotFound } = useMemo(() => {
    if (!searchTerm.trim()) return { filteredNotes: notes, isNotFound: false };

    const fuse = new Fuse(notes, {
      keys: ['titulo', 'tags'],
      threshold: 0.3,
    });

    const searchTerms = searchTerm.split(' ').filter((term) => term.length > 0);
    const results = fuse.search({
      $or: searchTerms.map((term) => ({
        $or: [{ titulo: term }, { tags: term }],
      })),
    });

    // Se digitou algo mas não achou nada
    if (results.length === 0) {
      return { filteredNotes: notes, isNotFound: true };
    }

    return { filteredNotes: results.map((r) => r.item), isNotFound: false };
  }, [notes, searchTerm]);

  return (
    <div className={styles.container}>
      {/* Passamos as tags únicas para o SearchBar decidir o que sugerir */}
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
        {filteredNotes.map((item) => (
          <div
            onClick={() => selectNote(item)}
            key={item.id}
            className={styles.card}
          >
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{item.titulo}</h3>
              <span className={styles.cardCategory}>{item.categoria}</span>
            </div>
            <div className={styles.cardBody}>
              <p className={styles.cardContent}>{item.content}</p>
              <Tags item={item} />
            </div>
          </div>
        ))}
      </div>

      {selectedNote && <NoteDetail />}
    </div>
  );
}
