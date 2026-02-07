import React, { useRef, useEffect, useState } from 'react';
import styles from './NoteContent.module.css';
import { useNotes } from '@/app/context/NoteContext';
import NoteBlock from './NoteBlock';
import { Block } from '@/app/types/note';

const NoteContent = () => {
  const { selectedNote, selectNote, updateNote } = useNotes();
  const [content, setContent] = useState<Block[]>(
    JSON.parse(selectedNote?.content || ''),
  );

  const handleBlockChange = (updatedBlock: Block) => {
    console.log('mudança', updatedBlock);

    setContent((prevContent) => {
      const updatedContent = prevContent.map((block) =>
        block.id === updatedBlock.id ? updatedBlock : block,
      );
      return updatedContent;
    });
  };

  const handleAddBlock = (blockId: string) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type: 'text',
      value: '',
    };

    setContent((prevContent) => {
      const index = prevContent.findIndex((block) => block.id === blockId);

      if (index === -1) return [...prevContent, newBlock];
      return [
        ...prevContent.slice(0, index + 1),
        newBlock,
        ...prevContent.slice(index + 1),
      ];
    });
  };

  useEffect(() => {
    if (!selectedNote) return;

    const timer = setTimeout(() => {
      updateNote(selectedNote.id, { content: JSON.stringify(content) });
      console.log('Nota salva no backend!');
    }, 10000);

    return () => clearTimeout(timer);
  }, [content, selectedNote, updateNote]);

  if (!selectedNote) {
    return <div className={styles.empty}>Selecione uma nota</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.noteContent}>
        {content.map((block) => (
          <NoteBlock
            onChange={handleBlockChange}
            onAddBlock={handleAddBlock}
            block={block}
            key={block.id}
          />
        ))}
      </div>
    </div>
  );
};

export default NoteContent;
