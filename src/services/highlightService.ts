import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-powershell';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';

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
