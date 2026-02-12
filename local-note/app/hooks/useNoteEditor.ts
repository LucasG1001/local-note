import { useState, useEffect } from 'react';
import { useNotes } from '@/app/context/NoteContext';
import { Block } from '@/app/types/note';

export const useNoteEditor = () => {
  const { updateNote, deleteNote, addNote } = useNotes();

  return {
    actions: { handleChange, handleDelete, handleAdd },
  };
};
