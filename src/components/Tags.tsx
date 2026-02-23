import styles from './Tags.module.css';

const Tags = ({ tags }: { tags: string[] }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.tagsList}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Tags;
