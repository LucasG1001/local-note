// Dentro do seu SearchBar.tsx (resumo da lógica)
import React, { useState, useEffect } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  suggestions: string[];
}

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  suggestions,
}: SearchBarProps) {
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Pega a última palavra digitada
  const words = searchTerm.split(' ');
  const lastWord = words[words.length - 1].toLowerCase();

  // Filtra as sugestões com base na última palavra
  const filteredSuggestions = suggestions.filter(
    (tag) => tag.toLowerCase().startsWith(lastWord) && lastWord.length > 1,
  );

  const handleSelectSuggestion = (tag: string) => {
    const newWords = [...words];
    newWords[newWords.length - 1] = tag;
    setSearchTerm(newWords.join(' ') + ' ');
    setShowSuggestions(false);
  };

  return (
    <div className={styles.searchWrapper}>
      <input
        className={styles.searchInput}
        spellCheck="false"
        autoComplete="off"
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowSuggestions(true);
        }}
        placeholder="Busque por tags..."
      />

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className={styles.suggestionList}>
          {filteredSuggestions.map((tag, index) => (
            <li
              key={tag}
              onClick={() => handleSelectSuggestion(tag)}
              className={styles.suggestionItem}
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
