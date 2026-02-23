'use client';
import { Block } from './types';
import { CodeBlock } from './CodeBlock';
import { useNoteEditor } from '../hooks/useNoteEditor';
import { useNoteShortcuts } from '../hooks/useNoteShortcuts';
import AutoResizableTextarea from '../components/textarea/AutoResizableTextarea';

interface NoteBlockProps {
  block: Block;
  readOnly?: boolean; // Nova prop opcional
}

export default function NoteBlock({ block, readOnly = false }: NoteBlockProps) {
  const editor = useNoteEditor();
  const shortcuts = useNoteShortcuts(block.id, editor);

  const handleKeyDown = readOnly ? undefined : shortcuts;

  const handleChange = (value: string) => {
    if (readOnly) return;
    editor.updateBlock(block.id, { value });
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      className={`block-container ${readOnly ? 'read-only' : ''}`}
    >
      {block.type === 'text' ? (
        <AutoResizableTextarea
          value={block.value}
          onChange={handleChange}
          readOnly={readOnly}
        />
      ) : (
        <CodeBlock
          value={block.value}
          language={block.language || 'javascript'}
          onChange={handleChange}
          editable={!readOnly}
        />
      )}
    </div>
  );
}
