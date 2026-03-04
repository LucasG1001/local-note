import Editor from 'react-simple-code-editor';
import { ChevronUp, Copy } from 'lucide-react';
import { highlightCode, copyToClipboard } from '../services/highlightService';
import { Dropdown } from '../components/Dropdown';
import React from 'react';
import styles from './CodeBlock.module.css';

interface Props {
  value: string;
  defaultLanguage: string;
  onChange: (val: string) => void;
  editable: boolean;
  language: string;
  setLanguage: (lang: string) => void;
}

const LAGUAGES = [
  'javascript',
  'python',
  'sql',
  'typescript',
  'java',
  'csharp',
  'rust',
  'shell',
  'powershell',
  'json',
  'xml',
  'html',
  'css',
  'markdown',
  'dockerfile',
  'tsx',
];

export const CodeBlock = ({
  value,
  onChange,
  editable,
  setLanguage,
  language,
}: Props) => {
  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleSelectLanguage = (lang: string) => {
    setLanguage(lang);
    setShowDropdown(false);
  };

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeBlockHeader}>
        <div
          className={`${styles.languageLabel} ${showDropdown ? styles.active : ''}`}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {language}
          <span className={styles.dropdownIcon}>
            <ChevronUp size={16} />
          </span>
        </div>
        {showDropdown && (
          <Dropdown
            items={LAGUAGES}
            activeIndex={LAGUAGES.indexOf(language)}
            onSelect={handleSelectLanguage}
            className={styles.dropdown}
          />
        )}

        <Copy
          onClick={() => copyToClipboard(value)}
          size={16}
          className={styles.copyIcon}
        />
      </div>
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={(code) => highlightCode(code, language)}
        padding={20}
        className={styles.editor}
        disabled={!editable}
      />
    </div>
  );
};
