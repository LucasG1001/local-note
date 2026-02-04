'use client';

import React, { createContext, useContext, useState } from 'react';
import { Note } from '../types/note';
// import { Note } from "../types/note";

interface NoteContextType {
  notes: Note[];
  selectedNote: Note | null;
  addNote: (note: Omit<Note, 'id'>) => void;
  updateNote: (id: number, updatedNote: Partial<Note>) => void;
  deleteNote: (id: number) => void;
  selectNote: (note: Note | null) => void;
}

const MOCK_NOTES: Note[] = [
  {
    id: 1,
    titulo: 'Exemplo de Hook React',
    tags: ['react', 'frontend'],
    content: `
    1. A Melhor Forma: Template Literals (Crase)
Introduzidas no ES6, as crases permitem que você quebre a linha naturalmente no código, e o JavaScript respeitará exatamente como você digitou, incluindo os espaços e tabulações.''
'''
var payload = new
{
    chat_id = _chatId,
    text = message
    // Sem parse_mode aqui
};
'''
2. Ajuste no WorkerAlertService.cs (Layout Limpo)
Para compensar a falta de negrito, usei Letras Maiúsculas nos rótulos e emojis para facilitar o "escaneamento" visual da mensagem.
    `,
    categoria: 'code',
  },
  {
    id: 2,
    titulo: 'João Silva',
    tags: ['trabalho', 'dev'],
    content: 'Telefone: (11) 99999-9999 \nE-mail: joao@email.com',
    categoria: 'contact',
  },
  {
    id: 3,
    titulo: 'Reunião de Planejamento',
    tags: ['projeto', 'urgente'],
    content: 'Segunda-feira às 14:00 no Meet.',
    categoria: 'event',
  },
];

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const addNote = (newNote: Omit<Note, 'id'>) => {
    const noteWithId = { ...newNote, id: Date.now() };
    setNotes((prev) => [...prev, noteWithId]);
  };

  const updateNote = (id: number, updatedFields: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...updatedFields } : note,
      ),
    );
    if (selectedNote?.id === id) {
      setSelectedNote((prev) => (prev ? { ...prev, ...updatedFields } : null));
    }
  };

  const deleteNote = (id: number) => {
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
