import Editor from "react-simple-code-editor";
import { Copy } from "lucide-react";
import { highlightCode, copyToClipboard } from "../services/highlightService";
import styles from "./NoteBlock.module.css";
import { Dropdown } from "../components/Dropdown";

interface Props {
  value: string;
  language: string;
  onChange: (val: string) => void;
  editable: boolean;
}

export const CodeBlock = ({ value, language, onChange, editable }: Props) => (
  <div className={styles.codeBlock}>
    <div className={styles.codeBlockHeader}>
      <Dropdown
        items={["javascript", "python"]}
        activeIndex={1}
        onSelect={onChange}
      />

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
