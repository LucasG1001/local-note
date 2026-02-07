import React, { useRef, useEffect, useState } from 'react';
import styles from './NoteContent.module.css';
import { useNotes } from '@/app/context/NoteContext';
import NoteBlock from './NoteBlock';
import { Block } from '@/app/types/note';
import { Copy, Plus } from 'lucide-react';
import CopyButton from '../components/Buttons/CopyButton';

const NoteContent = () => {
  const { selectedNote, selectNote, updateNote } = useNotes();
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

  const handleAddBlock = () => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type: 'text',
      value: '',
    };
    setContent((prevContent) => [...prevContent, newBlock]);
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
            block={block}
            key={block.id}
          />
        ))}
      </div>
    </div>
  );
};

export default NoteContent;
