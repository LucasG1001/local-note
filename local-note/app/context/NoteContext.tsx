"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react";
import { NewNote, Note } from "../types/note";
import { deleteNoteAction, createNoteAction } from "../actions/NoteActions";

interface NoteContextType {
  notes: Note[];
  activeNote: Note | null;
  setActiveNote: (note: Note | null) => void;
  isPending: boolean;
  saveNote: (note: NewNote) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({
  children,
  initialNotes,
}: {
  children: React.ReactNode;
  initialNotes: Note[] | [];
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const saveNote = async (note: NewNote) => {
    startTransition(async () => {
      const result = await createNoteAction(note);

      if (!result.success) {
        console.error(result.error);
        alert("Erro ao salvar");
      }
    });
  };

  const deleteNote = async (id: string) => {
    startTransition(async () => {
      const result = await deleteNoteAction(id);
      if (!result.success) alert(result.error);
    });
  };

  return (
    <NoteContext.Provider
      value={{
        activeNote,
        setActiveNote,
        isPending,
        saveNote,
        deleteNote,
        notes,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NoteContext);
  if (!context)
    throw new Error("useNotes deve ser usado dentro de um NoteProvider");
  return context;
}
