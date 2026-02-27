import { useEffect, useRef, useState } from "react";
import { useArrowNavigation } from "../hooks/useArrowNavigation";
import { useClickOutside } from "../hooks/useClickOutside";
import styles from "./SearchBar.module.css";
import { useTermMatcher } from "../hooks/useTermMatcher";
import { Dropdown } from "./Dropdown";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  suggestions: string[];
  setSelectedTags: (tags: string[]) => void;
}

export default function SearchBar({
  suggestions,
  setSelectedTags,
}: SearchBarProps) {
  const [value, setValue] = useState("");
  const lastWord = value.split(" ").pop() || "";
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);
  const matchedTags = useTermMatcher(value, suggestions);
  const filtredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.startsWith(lastWord.toLowerCase()) &&
      !matchedTags.includes(suggestion),
  );

  useEffect(() => {
    const currentMatchedCount = matchedTags.length;

    if (currentMatchedCount !== matchedCount) {
      setSelectedTags(matchedTags);
      setMatchedCount(currentMatchedCount);
    }
  }, [matchedTags]);

  const { activeIndex, handleKeyDown } = useArrowNavigation({
    itemsCount: filtredSuggestions.length,
    onSelect: (index) => handleSelect(filtredSuggestions[index]),
    onClose: () => setShowSuggestions(false),
  });

  console.log(matchedTags);

  const handleSelect = (tag: string) => {
    const words = value.split(" ");
    setValue(words.slice(0, words.length - 1).join(" ") + " " + tag);
  };

  return (
    <div className={styles.searchWrapper} /*ref={wrapperRef}*/>
      <input
        className={styles.searchInput}
        value={value}
        onKeyDown={handleKeyDown}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Busque por tags..."
      />

      {lastWord.length > 1 && (
        <Dropdown
          items={filtredSuggestions}
          activeIndex={activeIndex}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
