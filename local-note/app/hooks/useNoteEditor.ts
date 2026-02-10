import { useState, useEffect } from 'react';
import { useNotes } from '@/app/context/NoteContext';
import { Block } from '@/app/types/note';

export const useNoteEditor = () => {
  const { selectedNote, updateNote } = useNotes();
  const [content, setContent] = useState<Block[]>(
    selectedNote?.content || [
      {
        id: crypto.randomUUID(),
        type: 'text',
        value: '',
      },
    ],
  );
  const [isSaving, setIsSaving] = useState(false);

  console.log(content);

  useEffect(() => {
    if (selectedNote?.content) {
      setContent(selectedNote.content);
    } else {
      setContent([
        {
          id: crypto.randomUUID(),
          type: 'text',
          value: '',
        },
      ]);
    }
  }, [selectedNote?.id]);

  const updateBlockInList = (blocks: Block[], updatedBlock: Block): Block[] =>
    blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b));

  const removeBlockFromList = (blocks: Block[], blockId: string): Block[] =>
    blocks.filter((b) => b.id !== blockId);

  const createEmptyBlock = (): Block => ({
    id: crypto.randomUUID(),
    type: 'text',
    value: '',
  });

  const addBlockAfter = (blocks: Block[], newBlock: Block): Block[] => {
    return [...blocks, newBlock];
  };

  const handleChange = (updatedBlock: Block) =>
    setContent((prev) => updateBlockInList(prev, updatedBlock));

  const handleDelete = (id: string) =>
    setContent((prev) => removeBlockFromList(prev, id));
  const handleAdd = () =>
    setContent((prev) => addBlockAfter(prev, createEmptyBlock()));

  return {
    content,
    isSaving,
    selectedNote,
    actions: { handleChange, handleDelete, handleAdd },
  };
};
