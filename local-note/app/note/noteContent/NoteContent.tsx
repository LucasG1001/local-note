import React, { useRef, useEffect, useState } from 'react';
import styles from './NoteContent.module.css';
import { useNotes } from '@/app/context/NoteContext';
import NoteBlock from '../block/NoteBlock';
import { Block } from '@/app/types/note';

const NoteContent = () => {
  const { selectedNote, updateNote } = useNotes();
  const [content, setContent] = useState<Block[]>(
    JSON.parse(selectedNote?.content || ''),
  );

  const handleBlockChange = (updatedBlock: Block) => {
    setContent((prevContent) => {
      const updatedContent = prevContent.map((block) =>
        block.id === updatedBlock.id ? updatedBlock : block,
      );
      return updatedContent;
    });
  };

  useEffect(() => {
    if (!selectedNote) return;

    const timer = setTimeout(() => {
      console.log('Nota salva no backend!');
    }, 10000);

    return () => clearTimeout(timer);
  }, [content, selectedNote, updateNote]);

  if (!selectedNote) {
    return <div className={styles.empty}>Selecione uma nota</div>;
  }

  console.log(content);

  return (
    <div className={styles.container}>
      <div className={styles.noteContent}>
        {content.map((block) => (
          <NoteBlock
            onChange={handleBlockChange}
            block={block}
            key={block.id}
          />
        ))}
      </div>
    </div>
  );
};

export default NoteContent;
