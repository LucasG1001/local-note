import { Block } from '@/app/types/note';

export const useNoteBlock = (
  block: Block,
  onChange: (b: Block) => void,
  onAdd: (id: string) => void,
  onDelete: (id: string) => void,
) => {
  const handleValueChange = (newValue: string) => {
    onChange({ ...block, value: newValue });
  };

  const toggleBlockType = (type: 'text' | 'code') => {
    onChange({
      ...block,
      type,
      language: type === 'code' ? 'javascript' : '',
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!event.shiftKey) return;

    const actions: Record<string, () => void> = {
      KeyT: () => toggleBlockType('text'),
      KeyC: () => toggleBlockType('code'),
      Enter: () => onAdd(block.id),
      Delete: () => onDelete(block.id),
    };

    const action = actions[event.code];
    if (action) {
      event.preventDefault();
      action();
    }
  };

  return { handleValueChange, handleKeyDown, toggleBlockType };
};
