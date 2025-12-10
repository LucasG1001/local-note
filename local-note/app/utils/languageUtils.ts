import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-tomorrow.css";

export type Language = "javascript" | "sql" | "python" | "normal";

export const getLanguage = (code: string): Language => {
  const trimmed = code.trim();
  if (/select|from|where|insert|update|delete/i.test(trimmed)) return "sql";
  if (/def |import |print\(|:\s*$/i.test(trimmed)) return "python";
  if (/const |let |function |=>/i.test(trimmed)) return "javascript";
  return "normal";
};

export const highlightCode = (code: string, language: Language) =>
  Prism.highlight(code, Prism.languages[language], language);
