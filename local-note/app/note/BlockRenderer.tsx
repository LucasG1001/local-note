'use client';
import React from 'react';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism-okaidia.css';
import styles from './NoteBlock.module.css';
import { Block } from '@/app/types/note';

interface BlockRendererProps {
  block: Block;
  className?: string;
}

export default function BlockRenderer({ block }: BlockRendererProps) {
  const { language, type, value } = block;

  if (type === 'text') {
    return <div className={styles.textDisplay}>{value}</div>;
  }

  const lang = language?.toLowerCase() || 'javascript';
  const grammar = languages[lang] || languages.javascript;

  const highlightedCode = highlight(value, grammar, lang);

  return (
    <div className={styles.blockWrapper}>
      <div className={styles.codeBlockHeader}>
        <span className={styles.language}>{lang.toUpperCase()}</span>
      </div>
      <pre className={styles.editor}>
        <code
          className={`language-${lang}`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
}
