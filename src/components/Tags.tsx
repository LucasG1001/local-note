import { useState } from 'react';
import { useNotes } from '../context/NoteContext';
import { useNoteEditor } from '../hooks/useNoteEditor';
import styles from './Tags.module.css';
import { X } from 'lucide-react';

interface TagsProps {
  tags: string[];
}

const Tags = ({ tags }: TagsProps) => {
  if (!tags || tags.length === 0) return null;
  const { updateNote } = useNoteEditor();
  const { activeNote, setActiveNote } = useNotes();
  const [tag, setTag] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tag.trim() !== '') {
      if (!activeNote) return;
      const updatedTags = [...activeNote.tags, tag.trim()];
      setActiveNote({ ...activeNote, tags: updatedTags });
      setTag('');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tagsList}>
        {tags.map((tag) => (
          <>
            <span key={tag} className={styles.tag}>
              <X
                size={16}
                className={styles.icon}
                onClick={() =>
                  updateNote({ tags: tags.filter((t) => t !== tag) })
                }
              />
              #{tag}
            </span>
          </>
        ))}
      </div>
      <i className={styles.fakeCaret}></i>
      <input
        type="text"
        onKeyDown={handleKeyDown}
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        className={styles.tagInput}
        placeholder="Enter para adicionar tags"
        spellCheck="false"
      />
    </div>
  );
};

export default Tags;
