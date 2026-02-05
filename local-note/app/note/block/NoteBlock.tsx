import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import styles from './NoteBlock.module.css';

import { Block } from '@/app/types/note';

interface NoteBlockProps {
  block: Block;
  onChange: (updatedBlock: Block) => void;
}

export default function NoteBlock({ block, onChange }: NoteBlockProps) {
  const { language, type, value } = block;

  const handleValueChange = (newValue: string) => {
    onChange({ ...block, value: newValue });
  };

  if (type === 'text') {
    return (
      <textarea
        value={value}
        onChange={(e) => handleValueChange(e.target.value)}
        placeholder="Digite seu texto aqui..."
        className={styles.textarea}
      />
    );
  }

  if (type === 'code' && language) {
    return (
      <div className={styles.codeBlock}>
        <Editor
          value={value}
          onValueChange={handleValueChange}
          highlight={(code) => highlight(code, languages.js, language)}
          padding={10}
          className={styles.editor}
        />
      </div>
    );
  }

  return null;
}
