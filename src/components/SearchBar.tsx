import { useEffect, useRef, useState } from 'react';
import { useArrowNavigation } from '../hooks/useArrowNavigation';
import { useClickOutside } from '../hooks/useClickOutside';
import styles from './SearchBar.module.css';
import { useTermMatcher } from '../hooks/useTermMatcher';
import { Dropdown } from './Dropdown';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  suggestions: string[];
  setSelectedTags: (tags: string[]) => void;
}

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  suggestions,
  setSelectedTags,
}: SearchBarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const matchedTags = useTermMatcher(searchTerm, suggestions);

  useEffect(() => {
    if (matchedTags.length > 0) {
      setSelectedTags(matchedTags);
    }
  }, [matchedTags, setSelectedTags]);

  // 2. Filtro de Sugestões
  const words = searchTerm.split(/\s+/);
  const lastWord = words[words.length - 1].toLowerCase();
  const filtered = suggestions.filter(
    (s) => s.toLowerCase().startsWith(lastWord) && lastWord.length > 1,
  );

  const { activeIndex, handleKeyDown } = useArrowNavigation({
    itemsCount: filtered.length,
    onSelect: (index) => handleSelect(filtered[index]),
    onClose: () => setShowSuggestions(false),
    resetDependency: searchTerm,
  });

  // 4. Clique Fora
  useClickOutside(wrapperRef, () => setShowSuggestions(false));

  const handleSelect = (tag: string) => {
    const newWords = [...words];
    newWords[newWords.length - 1] = tag;
    setSearchTerm(newWords.join(' ') + ' ');
    setShowSuggestions(false);
  };

  return (
    <div className={styles.searchWrapper} ref={wrapperRef}>
      <input
        className={styles.searchInput}
        value={searchTerm}
        onKeyDown={handleKeyDown}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Busque por tags..."
      />

      {showSuggestions && filtered.length > 0 && (
        <Dropdown
          items={filtered}
          activeIndex={activeIndex}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
