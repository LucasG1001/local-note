import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
  useRef,
  useCallback,
} from "react";
import { invoke } from "@tauri-apps/api/core";
import { Note, NewNote } from "../note/types";

interface NoteContextType {
  notes: Note[];
  activeNote: Note | null;
  setActiveNote: (note: Note | null) => void;
  isPending: boolean;
  saveNote: (note: NewNote) => Promise<void>;
  updateActiveNote: (changes: Partial<Note>) => void;
  deleteNote: (id: string) => Promise<void>;
  searchNotes: (query: string) => Promise<void>;
  loadNotes: () => Promise<void>;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isPending, startTransition] = useTransition();
  const isInitialMount = useRef(true);

  // -----------------------------------------------------------------------
  // Load / Search
  // -----------------------------------------------------------------------

  const loadNotes = useCallback(async () => {
    try {
      const data = await invoke<Note[]>("get_notes", { limit: 50 });
      console.log(data);

      setNotes(data);
    } catch (error) {
      console.error("Erro ao carregar notas:", error);
    }
  }, []);

  const searchNotes = useCallback(async (query: string) => {
    try {
      const data = await invoke<Note[]>("search_notes", { query });
      setNotes(data);
    } catch (error) {
      console.error("Erro na busca vetorial:", error);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // -----------------------------------------------------------------------
  // Auto-save on activeNote changes (debounced 600ms)
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!activeNote?.id) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        try {
          await invoke("update_note", {
            id: activeNote.id,
            title: activeNote.title,
            content: activeNote.content,
          });
          // Don't reload the full list on every keystroke — too expensive
          // because update_note calls Gemini. We only reload after save settles.
        } catch (error) {
          console.error("Erro no auto-save:", error);
        }
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [activeNote]);

  // -----------------------------------------------------------------------
  // CRUD
  // -----------------------------------------------------------------------

  const updateActiveNote = useCallback((changes: Partial<Note>) => {
    setActiveNote((prev) => (prev ? { ...prev, ...changes } : prev));
  }, []);

  const saveNote = async ({ title, content }: NewNote) => {
    startTransition(async () => {
      try {
        await invoke<string>("create_note", { title, content });
        await loadNotes();
      } catch (error) {
        console.error("Erro ao criar nota:", error);
        alert("Não foi possível salvar a nota.");
      }
    });
  };

  const deleteNote = async (id: string) => {
    startTransition(async () => {
      try {
        await invoke("delete_note", { id });
        setNotes((prev) => prev.filter((n) => n.id !== id));
        if (activeNote?.id === id) setActiveNote(null);
      } catch (error) {
        console.error("Erro ao deletar nota:", error);
      }
    });
  };

  return (
    <NoteContext.Provider
      value={{
        activeNote,
        setActiveNote,
        isPending,
        saveNote,
        updateActiveNote,
        deleteNote,
        notes,
        loadNotes,
        searchNotes,
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
