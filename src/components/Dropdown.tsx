import styles from './Dropdown.module.css';

interface Props {
  items: string[];
  activeIndex: number;
  onSelect: (item: string) => void;
}

export const Dropdown = ({ items, activeIndex, onSelect }: Props) => (
  <ul className={styles.suggestionList}>
    {items.map((tag, index) => (
      <li
        key={tag}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onSelect(tag)}
        className={`${styles.suggestionItem} ${index === activeIndex ? styles.active : ''}`}
      >
        {tag}
      </li>
    ))}
  </ul>
);
