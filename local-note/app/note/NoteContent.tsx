import React, { useRef, useEffect, useState } from 'react';
import styles from './NoteContent.module.css';
import { useNotes } from '@/app/context/NoteContext';
import NoteBlock from './NoteBlock';
import { Block } from '@/app/types/note';

const NoteContent = () => {
  const { selectedNote, selectNote, updateNote } = useNotes();
  const [savePending, setSavePending] = useState(false);
  const [content, setContent] = useState<Block[]>(selectedNote?.content || []);

  useEffect(() => {
    if (!selectedNote) return;

    const timer = setTimeout(() => {
      setSavePending(true);
      updateNote(selectedNote.id, { content: content });
      setSavePending(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, selectedNote, updateNote]);

  const handleChange = (updatedBlock: Block) => {
    setContent((prevContent) => {
      const updatedContent = prevContent.map((block) =>
        block.id === updatedBlock.id ? updatedBlock : block,
      );
      return updatedContent;
    });
  };

  const handleDelete = (blockId: string) => {
    setContent((prevContent) => {
      const updatedContent = prevContent.filter(
        (block) => block.id !== blockId,
      );
      return updatedContent;
    });
  };

  const handleAdd = (blockId?: string) => {
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type: 'text',
      value: '',
    };

    setContent((prevContent) => {
      const index = prevContent.findIndex((block) => block.id === blockId);

      if (index === 0) return [newBlock, ...prevContent];

      if (index === -1) return [...prevContent, newBlock];
      return [
        ...prevContent.slice(0, index + 1),
        newBlock,
        ...prevContent.slice(index + 1),
      ];
    });
  };

  if (!selectedNote) {
    return <div className={styles.empty}>Selecione uma nota</div>;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>
        {savePending ? 'SALVANDO...' : 'INFORMAÇÃO SALVA'}
      </h3>

      <div className={styles.noteContent}>
        {content.map((block) => (
          <NoteBlock
            onChange={handleChange}
            onAddBlock={handleAdd}
            onDeleteBlock={handleDelete}
            block={block}
            key={block.id}
          />
        ))}
      </div>
    </div>
  );
};

export default NoteContent;
