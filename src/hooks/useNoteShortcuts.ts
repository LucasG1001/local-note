// hooks/useNoteShortcuts.ts
import React from 'react';
import { Block } from '../note/types';

interface ShortcutActions {
  updateBlock: (id: string, fields: Partial<Block>) => void;
  addBlock: () => void;
  deleteBlock: (id: string) => void;
}

export function useNoteShortcuts(blockId: string, actions: ShortcutActions) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!event.shiftKey) return;

    const shortcutMap: Record<string, () => void> = {
      KeyT: () => actions.updateBlock(blockId, { type: 'text' }),
      KeyC: () =>
        actions.updateBlock(blockId, { type: 'code', language: 'javascript' }),
      Enter: () => actions.addBlock(),
      Delete: () => actions.deleteBlock(blockId),
    };

    const action = shortcutMap[event.code];

    if (action) {
      event.preventDefault();
      action();
    }
  };

  return handleKeyDown;
}
