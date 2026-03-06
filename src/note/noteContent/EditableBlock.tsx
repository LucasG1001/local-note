import React from 'react';
import styles from './NoteContent.module.css';
import { EditorBlock } from '../../components/FileExplorer/types';

interface EditableBlockProps {
  block: EditorBlock;
  index: number;
  updateBlock: (id: string, content: string) => void;
  handleKeyDown: (e: React.KeyboardEvent, index: number) => void;
}

export const EditableBlock = ({
  block,
  index,
  updateBlock,
  handleKeyDown,
}: EditableBlockProps) => {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (ref.current && ref.current.innerHTML !== block.content) {
      ref.current.innerHTML = block.content;
    }
  }, [block.content]);

  const Tag = block.type;

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={
        styles[
          `block${block.type.charAt(0).toUpperCase() + block.type.slice(1)}`
        ] ?? styles.blockP
      }
      onInput={(e) => updateBlock(block.id, e.currentTarget.innerHTML)}
      onKeyDown={(e) => {
        handleKeyDown(e, index);
      }}
    />
  );
};
