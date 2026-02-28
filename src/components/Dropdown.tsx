import { memo } from 'react';
import styles from './Dropdown.module.css';

interface Props {
  items: string[];
  activeIndex: number;
  onSelect: (item: string) => void;
  className?: string;
}

export const Dropdown = memo(
  ({ items, activeIndex, onSelect, className = '' }: Props) => {
    if (items.length === 0) return null;

    return (
      <ul className={`${styles.list} ${className}`} role="listbox">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            role="option"
            aria-selected={index === activeIndex}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(item)}
            className={`${styles.item} ${index === activeIndex ? styles.active : ''}`}
          >
            {item}
          </li>
        ))}
      </ul>
    );
  },
);

Dropdown.displayName = 'Dropdown';
