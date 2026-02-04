import React, { useRef, useEffect, useState } from 'react';
import styles from './NoteContent.module.css';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';
import { useNotes } from '@/app/context/NoteContext';
import AutoResizableTextarea from '@/app/components/AutoResizableTextarea/AutoResizableTextarea';

const NoteContent = () => {
  const { selectedNote, updateNote } = useNotes();
  const [content, setContent] = useState(selectedNote?.content || '');

  const isPending = selectedNote && content !== selectedNote.content;

  useEffect(() => {
    if (!isPending || !selectedNote) return;

    const timer = setTimeout(() => {
      updateNote(selectedNote.id, { content });
      console.log('Nota salva no backend!');
    }, 10000);

    return () => clearTimeout(timer);
  }, [content, isPending, selectedNote, updateNote]);

  const handleBlockChange = (
    index: number,
    newValue: string,
    allBlocks: string[],
  ) => {
    const newBlocks = [...allBlocks];
    newBlocks[index] = newValue;
    setContent(newBlocks.join(''));
  };

  if (!selectedNote) {
    return <div className={styles.empty}>Selecione uma nota</div>;
  }

  const blocks = content.split(/(^'''[\s\S]*?''')/gm);

  console.log(blocks[1]);

  return (
    <div className={styles.container}>
      <div className={styles.noteContent}>
        {blocks.map((block, index) => {
          if (block.startsWith("'''") && block.endsWith("'''")) {
            return (
              <Editor
                key={index}
                value={block.replaceAll("'''", '')}
                onValueChange={(code) =>
                  handleBlockChange(index, `'''${code}'''`, blocks)
                }
                highlight={(code) =>
                  highlight(code, languages.js, 'javascript')
                }
                className={styles.noteEditor}
              />
            );
          }
          return (
            <AutoResizableTextarea
              key={index}
              value={block}
              onChange={(value) => handleBlockChange(index, value, blocks)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default NoteContent;
