'use client';

import React, { createContext, useContext, useState } from 'react';
import { Block, Note } from '../types/note';

interface NoteContextType {
  notes: Note[];
  selectedNote: Note | null;
  addNote: (note: Omit<Note, 'id'>) => void;
  updateNote: (id: string, updatedNote: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  selectNote: (note: Note | null) => void;
}

const block: Block[] = [
  {
    id: crypto.randomUUID(),
    type: 'text',
    value: `
    2. Validando o JSON
Para garantir que ninguém insira um texto malformado (um "JSON quebrado"), você pode usar uma Check Constraint. Isso impede que dados inválidos entrem no banco:`,
  },
  {
    id: crypto.randomUUID(),
    type: 'code',
    language: 'javascript',
    value: `
var payload = new
{
    chat_id = _chatId,
    text = message
    // Sem parse_mode aqui
};`,
  },
  {
    id: crypto.randomUUID(),
    type: 'code',
    language: 'sql',
    value: `
    CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY,
    perfil TEXT CHECK(json_valid(perfil))
);
`,
  },
];

const MOCK_NOTES: Note[] = [
  {
    id: crypto.randomUUID(),
    titulo: 'Exemplo de Hook React',
    tags: ['react', 'frontend'],
    content: block,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const addNote = (newNote: Omit<Note, 'id'>) => {
    const noteWithId = { ...newNote, id: crypto.randomUUID() };
    setNotes((prev) => [...prev, noteWithId]);
  };

  const updateNote = (id: string, updatedFields: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...updatedFields } : note,
      ),
    );
    if (selectedNote?.id === id) {
      setSelectedNote((prev) => (prev ? { ...prev, ...updatedFields } : null));
    }
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  const selectNote = (note: Note | null) => {
    setSelectedNote(note);
  };

  return (
    <NoteContext.Provider
      value={{
        notes,
        selectedNote,
        addNote,
        updateNote,
        deleteNote,
        selectNote,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNotes deve ser usado dentro de um NoteProvider');
  }
  return context;
}
