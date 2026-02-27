import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
  useRef,
} from "react";
import { invoke } from "@tauri-apps/api/core";
import { BackendNote, Block, NewNote, Note } from "../note/types";

interface NoteContextType {
  notes: Note[];
  activeNote: Note | null;
  setActiveNote: (note: Note | null) => void;
  isPending: boolean;
  saveNote: (note: NewNote) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  loadNotes: () => Promise<void>;
  setSelectedTags: (tags: string[]) => void;
  tags: string[];
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isPending, startTransition] = useTransition();
  const isInitialMount = useRef(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const getNotesByTags = async (tags: string[]) => {
    try {
      const data = await invoke<BackendNote[]>("get_notes_by_tags", {
        searchTags: tags,
      });
      const processedNotes: Note[] = data.map((note) => ({
        ...note,
        content: JSON.parse(note.content) as Block[],
      }));
      setNotes(processedNotes);
    } catch (error) {
      console.error("Erro ao carregar notas por tags:", error);
    }
  };

  const getNotes = async () => {
    try {
      const data = await invoke<BackendNote[]>("get_notes", { limit: 100 });
      const processedNotes: Note[] = data.map((note) => ({
        ...note,
        content: JSON.parse(note.content) as Block[],
      }));
      setNotes(processedNotes);
      setTags([...new Set(data.map((note) => note.tags).flat())]);
    } catch (error) {
      console.error("Erro ao carregar notas:", error);
    }
  };

  const loadNotes = async () => {
    try {
      if (selectedTags.length > 0) return getNotesByTags(selectedTags);
      await getNotes();
    } catch (error) {
      console.error("Erro ao carregar notas:", error);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [selectedTags]);

  useEffect(() => {
    if (!activeNote || !activeNote.id) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        try {
          const contentString =
            typeof activeNote.content === "string"
              ? activeNote.content
              : JSON.stringify(activeNote.content);

          await invoke("update_note", {
            id: activeNote.id,
            title: activeNote.title,
            content: contentString,
            tags: activeNote.tags || [],
            rank: activeNote.rank || 0,
          });

          await loadNotes();
        } catch (error) {
          console.error("Erro no auto-save:", error);
        }
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [activeNote]);

  const saveNote = async ({ title, content }: NewNote) => {
    startTransition(async () => {
      try {
        await invoke("create_note", {
          title,
          content: JSON.stringify(content),
        });
        await loadNotes();
      } catch (error) {
        alert("Erro ao salvar no banco local");
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
        console.error(error);
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
        deleteNote,
        notes,
        loadNotes,
        setSelectedTags,
        tags,
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
