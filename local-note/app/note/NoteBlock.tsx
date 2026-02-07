'use client';
import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight } from 'prismjs';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-sql';
import styles from './NoteBlock.module.css';
import 'prismjs/themes/prism-okaidia.css';
import { Block } from '@/app/types/note';
import AutoResizableTextarea from '@/app/components/AutoResizableTextarea/AutoResizableTextarea';
import { Copy, Plus } from 'lucide-react';

interface NoteBlockProps {
  block: Block;
  onChange: (updatedBlock: Block) => void;
  onAddBlock: (blockId: string) => void;
}

export default function NoteBlock({
  block,
  onChange,
  onAddBlock,
}: NoteBlockProps) {
  const { language, type, value } = block;

  if (!block) return null;

  const handleValueChange = (newValue: string) => {
    onChange({ ...block, value: newValue });
  };

  const toggleBlockType = (type: 'text' | 'code') => {
    onChange({
      ...block,
      type: type,
      language: type === 'code' ? 'javascript' : '',
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const isModifier = event.shiftKey;

    if (isModifier) {
      // Usamos o code para ser mais preciso (KeyT é a tecla T)
      if (event.code === 'KeyT' || event.code === 'KeyC') {
        event.preventDefault();
        event.stopPropagation();

        if (event.code === 'KeyT') toggleBlockType('text');
        if (event.code === 'KeyC') toggleBlockType('code');
      }
    }
  };

  const lang = language?.toLowerCase() || 'javascript';
  const grammar =
    Prism.languages[lang] ||
    Prism.languages.javascript ||
    Prism.languages.plain;

  return (
    <div className={styles.blockWrapper} onKeyDown={handleKeyDown}>
      {type === 'text' ? (
        <AutoResizableTextarea value={value} onChange={handleValueChange} />
      ) : (
        <div className={styles.codeBlock}>
          <div className={styles.codeBlockHeader}>
            <span className={styles.language}>{lang.toUpperCase()}</span>
            <Copy
              onClick={() => navigator.clipboard.writeText(value)}
              size={16}
              className={styles.copyIcon}
            />
          </div>
          <Editor
            value={value}
            onValueChange={handleValueChange}
            highlight={(code) => highlight(code, grammar, lang)}
            padding={20}
            className={styles.editor}
          />
        </div>
      )}
      <button
        className={styles.addButton}
        onClick={() => onAddBlock(block.id)}
        title="Adicionar bloco"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
