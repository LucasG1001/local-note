// hooks/useNoteEditor.ts
import { useNotes } from '../context/NoteContext';
import { Block } from '../note/types';

export function useNoteEditor() {
  const { setActiveNote, activeNote } = useNotes();

  const createDefaultBlock = () => ({
    id: crypto.randomUUID(),
    type: 'text' as const,
    value: '',
  });

  const blocks =
    activeNote?.content.length === 0
      ? [createDefaultBlock()]
      : activeNote?.content || [];

  const updateBlock = (id: string, updatedFields: Partial<Block>) => {
    if (!activeNote) return;
    const newBlocks = activeNote.content.map((b) =>
      b.id === id ? { ...b, ...updatedFields } : b,
    );
    setActiveNote({ ...activeNote, content: newBlocks });
  };

  const deleteBlock = (id: string) => {
    if (!activeNote) return;
    const newBlocks = activeNote.content.filter((b) => b.id !== id);
    setActiveNote({ ...activeNote, content: newBlocks });
  };

  const addBlock = () => {
    if (!activeNote) return;
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type: 'text',
      value: '',
    };
    setActiveNote({
      ...activeNote,
      content: [...activeNote.content, newBlock],
    });
  };

  return { blocks, activeNote, updateBlock, deleteBlock, addBlock };
}
