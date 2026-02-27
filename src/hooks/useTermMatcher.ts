import { useMemo } from "react";

interface MatchOptions {
  separator?: RegExp | string;
  caseSensitive?: boolean;
}

const DEFAULT_SEPARATOR = /\s+/;

export function useTermMatcher(
  input: string,
  referenceList: string[],
  options: MatchOptions = {},
) {
  const { separator = DEFAULT_SEPARATOR, caseSensitive = false } = options;

  return useMemo(() => {
    if (!input) return [];

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
  }, [input, referenceList, separator, caseSensitive]);
}
