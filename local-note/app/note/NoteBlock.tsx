'use client';
import React from 'react';
import { Block } from '@/app/types/note';
import AutoResizableTextarea from '@/app/components/AutoResizableTextarea/AutoResizableTextarea';
import styles from './NoteBlock.module.css';
import { useNoteBlock } from '../hooks/useNoteBlocks';
import { CodeBlock } from './CodeBlock';

interface NoteBlockProps {
  block: Block;
  onChange: (updatedBlock: Block) => void;
  onAddBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
}

export default function NoteBlock({
  block,
  onChange,
  onAddBlock,
  onDeleteBlock,
}: NoteBlockProps) {
  const { handleValueChange, handleKeyDown } = useNoteBlock(
    block,
    onChange,
    onAddBlock,
    onDeleteBlock,
  );

  if (!block) return null;

  return (
    <div className={styles.blockWrapper} onKeyDown={handleKeyDown}>
      {block.type === 'text' ? (
        <AutoResizableTextarea
          value={block.value}
          onChange={handleValueChange}
        />
      ) : (
        <CodeBlock
          value={block.value}
          language={block.language || 'javascript'}
          onChange={handleValueChange}
          editable={true}
        />
      )}
    </div>
  );
}
