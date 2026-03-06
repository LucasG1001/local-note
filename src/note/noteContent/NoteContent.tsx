import { EditableBlock } from './EditableBlock';
import styles from './NoteContent.module.css';
import { useNoteBlocks } from './useNoteBlocks';
import { NormalizedFileNode } from '../../components/FileExplorer/types';

interface NoteContentProps {
  note: NormalizedFileNode;
}

const NoteContent = ({ note }: NoteContentProps) => {
  const { blocks, updateBlock, handleKeyDown } = useNoteBlocks(note);

  return (
    <main className={styles.noteContainer}>
      <div className={styles.blocks}>
        {blocks.map((block, index) => (
          <EditableBlock
            key={block.id}
            block={block}
            index={index}
            updateBlock={updateBlock}
            handleKeyDown={handleKeyDown}
          />
        ))}
      </div>
    </main>
  );
};

export default NoteContent;
