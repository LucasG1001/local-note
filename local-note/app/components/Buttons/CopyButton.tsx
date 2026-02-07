import { Plus } from 'lucide-react';
import React from 'react';
import styles from './CopyButton.module.css';

interface CopyButtonProps {
  handleClick: () => void;
}

const CopyButton = ({ handleClick }: CopyButtonProps) => {
  return (
    <div>
      <button onClick={handleClick}>
        <Plus size={20} className={styles.plusIcon} />
      </button>
    </div>
  );
};

export default CopyButton;
