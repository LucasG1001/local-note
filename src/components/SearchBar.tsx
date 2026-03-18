import { useEffect, useRef, useState } from 'react';
import styles from './SearchBar.module.css';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
}

export default function SearchBar({ onSearch, onClear }: SearchBarProps) {
  const [value, setValue] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim() === '') {
      onClear();
      return;
    }

    debounceRef.current = setTimeout(() => {
      onSearch(value.trim());
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  return (
    <div className={styles.searchWrapper}>
      <Search size={16} className={styles.searchIcon} />
      <input
        className={styles.searchInput}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Busca semântica..."
      />
      {value && (
        <button
          className={styles.clearBtn}
          onClick={() => setValue('')}
          title="Limpar busca"
        >
          ×
        </button>
      )}
    </div>
  );
}
