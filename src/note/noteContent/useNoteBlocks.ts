import React from 'react';
import {
  EditorBlock,
  NormalizedFileNode,
} from '../../components/FileExplorer/types';

function parseBlocks(content: NormalizedFileNode['content']): EditorBlock[] {
  try {
    return typeof content === 'string'
      ? JSON.parse(content || '[]')
      : (content as EditorBlock[]) || [];
  } catch {
    return [];
  }
}

export function useNoteBlocks(note: NormalizedFileNode) {
  const [blocks, setBlocks] = React.useState<EditorBlock[]>(() =>
    parseBlocks(note.content),
  );

  const updateBlock = React.useCallback((id: string, newContent: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content: newContent } : b)),
    );
  }, []);

  const insertBlockAfter = React.useCallback((index: number) => {
    const newBlock: EditorBlock = {
      id: crypto.randomUUID(),
      type: 'p',
      content: '',
    };
    setBlocks((prev) => {
      const updated = [...prev];
      updated.splice(index + 1, 0, newBlock);
      return updated;
    });
  }, []);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        insertBlockAfter(index);
      }
    },
    [insertBlockAfter],
  );

  return { blocks, updateBlock, handleKeyDown };
}
