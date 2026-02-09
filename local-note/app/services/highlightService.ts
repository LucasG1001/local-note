import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-sql';

export const highlightCode = (code: string, language: string) => {
  const lang = language.toLowerCase() || 'javascript';
  const grammar =
    Prism.languages[lang] ||
    Prism.languages.javascript ||
    Prism.languages.plain;
  return Prism.highlight(code, grammar, lang);
};

export const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
};
