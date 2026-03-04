import React from 'react';
import { NormalizedFileNode } from '../components/FileExplorer/types';
import styles from './NoteContent.module.css';

interface EditorBlock {
  id: string;
  type: 'h1' | 'p' | 'list-item' | 'code';
  content: string;
}

interface NoteContentProps {
  note: NormalizedFileNode;
}

const NoteContent = ({ note }: NoteContentProps) => {
  // Estado local para os blocos (para edição fluida)
  const [blocks, setBlocks] = React.useState<EditorBlock[]>(() => {
    try {
      return typeof note.content === 'string'
        ? JSON.parse(note.content || '[]')
        : (note.content as any) || [];
    } catch {
      return [];
    }
  });

  const updateBlock = (id: string, newContent: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content: newContent } : b)),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Lógica para criar novo bloco abaixo
      const newBlock: EditorBlock = {
        id: crypto.randomUUID(),
        type: 'p',
        content: '',
      };
      const updated = [...blocks];
      updated.splice(index + 1, 0, newBlock);
      setBlocks(updated);

      // O próximo passo seria dar focus() no novo elemento
    }
  };

  return (
    <main className={styles.noteContainer}>
      {blocks.map((block, index) => {
        // Renderização dinâmica baseada no tipo
        const Tag = block.type === 'list-item' ? 'li' : block.type;

        return (
          <Tag
            key={block.id}
            contentEditable
            suppressContentEditableWarning // Evita aviso do React por ter filhos e ser editável
            className={
              styles[`block${block.type.toUpperCase()}`] || styles.blockP
            }
            onInput={(e) =>
              updateBlock(block.id, e.currentTarget.textContent || '')
            }
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {block.content}
          </Tag>
        );
      })}
    </main>
  );
};

export default NoteContent;
