import React from 'react';

interface AutoResizableTextareaProps {
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}

export default function AutoResizableTextarea({
  value,
  onChange,
  style,
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
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        adjustHeight();
      }}
      rows={1}
      style={{ ...style, resize: 'none', overflow: 'hidden' }}
    />
  );
}
