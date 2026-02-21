import React from 'react';
import styles from './AutoResizableTextarea.module.css';

interface AutoResizableTextareaProps {
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
  readOnly?: boolean;
}

export default function AutoResizableTextarea({
  value,
  onChange,
  style,
  readOnly = false,
}: AutoResizableTextareaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  React.useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      readOnly={readOnly}
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        adjustHeight();
      }}
      rows={1}
      className={styles.textarea}
      style={{ ...style, resize: 'none', overflow: 'hidden', width: '100%' }}
      spellCheck="false"
      placeholder="..."
    />
  );
}
