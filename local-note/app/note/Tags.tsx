import React from 'react';
import { Tag } from 'lucide-react';
import styles from './Tags.module.css'; // Importando o módulo CSS

interface TagsProps {
  item: InfoCard | null;
}

const Tags = ({ item }: TagsProps) => {
  // Early return se o item ou as tags não existirem
  if (!item || !item.tags) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Tag size={14} />
        <span className={styles.title}>Tags</span>
      </header>

      <div className={styles.tagsList}>
        {item.tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Tags;
