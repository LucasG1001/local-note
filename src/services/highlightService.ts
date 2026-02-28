import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

import 'prism-themes/themes/prism-vsc-dark-plus.css';

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
