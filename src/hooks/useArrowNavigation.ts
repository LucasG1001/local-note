import { useState, useEffect, KeyboardEvent } from 'react';

interface NavigationProps {
  itemsCount: number;
  onSelect: (index: number) => void;
  onClose: () => void;
  resetDependency: any;
}

export function useArrowNavigation({
  itemsCount,
  onSelect,
  onClose,
  resetDependency,
}: NavigationProps) {
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setActiveIndex(-1);
  }, [resetDependency]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (itemsCount === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < itemsCount - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
      case 'Tab':
        if (activeIndex >= 0) {
          e.preventDefault();
          onSelect(activeIndex);
        }
        break;
      case 'Escape':
        onClose();
        break;
      default:
        break;
    }
  };

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
  };
}
