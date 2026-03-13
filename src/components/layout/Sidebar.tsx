import { Plus, Search, Tag, Github } from 'lucide-react';
import { useState } from 'react';
import { useNotes } from '../../context/NoteContext';
import styles from './Sidebar.module.css';

const emptyNote = {
  title: "Nova nota",
  content: [
    {
      id: crypto.randomUUID(),
      type: "text",
      language: "javascript",
      value: "",
    },
  ],
  tags: [],
};

export default function Sidebar() {
  const { tags, saveNote, setSelectedTags } = useNotes();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      setActiveTag(null);
      setSelectedTags([]); // clear filter
    } else {
      setActiveTag(tag);
      setSelectedTags([tag]);
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>L</div>
          <span className={styles.userName}>Lucas's Notes</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.actionBtn} onClick={() => {}}>
          <Search size={16} />
          <span>Pesquisar</span>
        </button>
        <button 
          className={styles.actionBtn} 
          onClick={async () => {
             // @ts-ignore
             await saveNote(emptyNote);
          }}
        >
          <Plus size={16} />
          <span>Nova nota</span>
        </button>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Tags</div>
        <div className={styles.tagList}>
          {tags.map((tag) => (
            <button
              key={tag}
              className={`${styles.tagItem} ${activeTag === tag ? styles.active : ''}`}
              onClick={() => handleTagClick(tag)}
            >
              <Tag size={14} className={styles.tagIcon} />
              <span>{tag}</span>
            </button>
          ))}
          {tags.length === 0 && (
            <div className={styles.emptyTags}>Nenhuma tag encontrada</div>
          )}
        </div>
      </div>
    </aside>
  );
}
