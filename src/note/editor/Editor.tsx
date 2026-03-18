import React from 'react';
import styles from './Editor.module.css';

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, placeholder }) => {
  return (
    <div className={styles.container}>
      <textarea
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Escreva sua nota aqui...'}
        spellCheck={false}
      />
    </div>
  );
};

export default Editor;