import React from 'react';
import styles from './NoteContent.module.css';
import NoteBlock from './NoteBlock';
import { useNoteEditor } from '../hooks/useNoteEditor';

const NoteContent = () => {
  const { content, isSaving, selectedNote, actions } = useNoteEditor();

  if (!selectedNote) {
    return <div className={styles.empty}>Selecione uma nota</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h3 className={styles.sectionTitle}>
          {isSaving ? 'SALVANDO...' : 'INFORMAÇÃO SALVA'}
        </h3>
      </header>

      <div className={styles.noteContent}>
        {content.map((block) => (
          <NoteBlock
            key={block.id}
            block={block}
            onChange={actions.handleChange}
            onAddBlock={actions.handleAdd}
            onDeleteBlock={actions.handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default NoteContent;
