"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Block, Note } from "../types/note";

interface NoteContextType {
  notes: Note[];
  selectedNote: Note | null;
  addNote: (note: Omit<Note, "id">) => void;
  updateNote: (id: string, updatedNote: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setSelectedNoteId: (id: string | null) => void;
  updateBlock: (id: string, updatedBlock: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  addBlock: () => void;
}

const block: Block[] = [
  {
    id: crypto.randomUUID(),
    type: "text",
    value: `
    2. Validando o JSON
Para garantir que ninguém insira um texto malformado (um "JSON quebrado"), você pode usar uma Check Constraint. Isso impede que dados inválidos entrem no banco:`,
  },
  {
    id: crypto.randomUUID(),
    type: "code",
    language: "javascript",
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
    type: "code",
    language: "sql",
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
    titulo: "Exemplo de Hook React",
    tags: ["react", "frontend"],
    content: block,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const selectedNote = useMemo(() => {
    const selectedNote = notes.find((n) => n.id === selectedNoteId);
    if (selectedNote?.content.length === 0) {
      selectedNote.titulo = "";
      selectedNote.content = [
        {
          id: crypto.randomUUID(),
          type: "text",
          value: "...",
        },
      ];
    }
    return selectedNote || null;
  }, [notes, selectedNoteId]);

  const addNote = (newNote: Omit<Note, "id">) => {
    const noteWithId: Note = {
      ...newNote,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes((prev) => [noteWithId, ...prev]);
    setSelectedNoteId(noteWithId.id);
  };

  const updateNote = useCallback((id: string, updatedFields: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, ...updatedFields, updatedAt: new Date() }
          : note,
      ),
    );
  }, []);

  const updateBlock = useCallback(
    (id: string, updatedBlock: Partial<Block>) => {
      console.log("Atualizando", updatedBlock, id);

      setNotes((prev) =>
        prev.map((note) =>
          note.id === selectedNoteId
            ? {
                ...note,
                content: note.content.map((block) =>
                  block.id === id ? { ...block, ...updatedBlock } : block,
                ),
              }
            : note,
        ),
      );
    },
    [selectedNoteId],
  );

  const deleteBlock = useCallback(
    (id: string) => {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === selectedNoteId
            ? {
                ...note,
                content: note.content.filter((block) => block.id !== id),
              }
            : note,
        ),
      );
    },
    [selectedNoteId],
  );

  const addBlock = useCallback(() => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === selectedNoteId
          ? {
              ...note,
              content: [
                ...note.content,
                {
                  id: crypto.randomUUID(),
                  type: "text",
                  value: "",
                },
              ],
            }
          : note,
      ),
    );
  }, [selectedNoteId]);

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNoteId === id) setSelectedNoteId(null);
  };

  return (
    <NoteContext.Provider
      value={{
        notes,
        selectedNote,
        addNote,
        updateNote,
        deleteNote,
        setSelectedNoteId,
        updateBlock,
        deleteBlock,
        addBlock,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error("useNotes deve ser usado dentro de um NoteProvider");
  }
  return context;
}
