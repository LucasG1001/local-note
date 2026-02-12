'use client';
import React, { useEffect } from 'react';
import { Block } from '@/app/types/note';
import AutoResizableTextarea from '@/app/components/AutoResizableTextarea/AutoResizableTextarea';
import styles from './NoteBlock.module.css';
import { CodeBlock } from './CodeBlock';
import { useNotes } from '../context/NoteContext';

interface NoteBlockProps {
  block: Block;
}

export default function NoteBlock({ block }: NoteBlockProps) {
  const { updateBlock, deleteBlock, addBlock } = useNotes();
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!event.shiftKey) return;

    const actions: Record<string, () => void> = {
      KeyT: () => updateBlock(block.id, { type: 'text' }),
      KeyC: () => updateBlock(block.id, { type: 'code' }),
      Enter: () => addBlock(),
      Delete: () => deleteBlock(block.id),
    };

    const action = actions[event.code];
    if (action) {
      event.preventDefault();
      action();
    }
  };

  const handleChange = (value: string) => {
    updateBlock(block.id, { value: value });
  };

  return (
    <div className={styles.blockWrapper} onKeyDown={handleKeyDown}>
      {block.type === 'text' ? (
        <AutoResizableTextarea value={block.value} onChange={handleChange} />
      ) : (
        <CodeBlock
          value={block.value}
          language={block.language || 'javascript'}
          onChange={handleChange}
          editable={true}
        />
      )}
    </div>
  );
}
