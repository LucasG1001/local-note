import { useMemo } from 'react';

interface MatchOptions {
  separator?: RegExp | string;
  caseSensitive?: boolean;
}

// 1. Defina os padrões fora do hook para manter a mesma referência de memória
const DEFAULT_SEPARATOR = /\s+/;

export function useTermMatcher(
  input: string,
  referenceList: string[],
  options: MatchOptions = {},
) {
  // 2. Use os padrões estáticos
  const { separator = DEFAULT_SEPARATOR, caseSensitive = false } = options;

  return useMemo(() => {
    if (!input) return []; // Otimização: se não há input, retorna vazio

    const terms = input
      .split(separator)
      .map((t) => t.trim())
      .filter(Boolean);

    const matches = terms.filter((term) =>
      referenceList.some((ref) => {
        return caseSensitive
          ? ref === term
          : ref.toLowerCase() === term.toLowerCase();
      }),
    );

    return Array.from(new Set(matches));

    // O referenceList também precisa ser estável no componente pai!
  }, [input, referenceList, separator, caseSensitive]);
}
