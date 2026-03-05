import React from 'react';
import {
  NormalizedFileNode,
  EditorBlock,
} from '../components/FileExplorer/types';
import styles from './NoteContent.module.css';

interface NoteContentProps {
  note: NormalizedFileNode;
}

const NoteContent = ({ note }: NoteContentProps) => {
  const [blocks, setBlocks] = React.useState<EditorBlock[]>(() => {
    try {
      return typeof note.content === 'string'
        ? JSON.parse(note.content || '[]')
        : (note.content as any) || [];
    } catch {
      return [];
    }
  });

  const updateBlock = React.useCallback((id: string, newContent: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content: newContent } : b)),
    );
  }, []);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        const newBlock: EditorBlock = {
          id: crypto.randomUUID(),
          type: 'p',
          content: '',
        };
        setBlocks((currentBlocks) => {
          const updated = [...currentBlocks];
          updated.splice(index + 1, 0, newBlock);
          return updated;
        });
      }
    },
    [],
  );

  return (
    <main className={styles.noteContainer}>
      {blocks.map((block, index) => (
        <EditableBlock
          key={block.id}
          block={block}
          index={index}
          updateBlock={updateBlock}
          handleKeyDown={handleKeyDown}
        />
      ))}
    </main>
  );
};

const EditableBlock = ({
  block,
  index,
  updateBlock,
  handleKeyDown,
}: {
  block: EditorBlock;
  index: number;
  updateBlock: (id: string, content: string) => void;
  handleKeyDown: (e: React.KeyboardEvent, index: number) => void;
}) => {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (ref.current && ref.current.innerHTML !== block.content) {
      ref.current.innerHTML = block.content;
    }
  }, [block]);

  const Tag = block.type === 'list-item' ? 'li' : block.type;

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={styles[`block${block.type.toUpperCase()}`] || styles.blockP}
      onInput={(e) => updateBlock(block.id, e.currentTarget.innerHTML)}
      onKeyDown={(e) => handleKeyDown(e, index)}
    />
  );
};

export default NoteContent;
