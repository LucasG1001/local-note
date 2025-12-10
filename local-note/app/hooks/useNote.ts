import { useCallback, useEffect, useState } from "react";

export interface NoteSection {
  id: string;
  title: string;
  text: string;
  type: "text" | "code";
}

const INITIAL_SECTIONS: NoteSection[] = [
  {
    id: "1",
    title: "Introdução",
    text: "Bem-vindo ao documento! Aqui você encontrará uma visão geral do conteúdo.",
    type: "text",
  },
  {
    id: "2",
    title: "SQL Criação de procedure",
    text: "SELECT * FROM table_name;",
    type: "code",
  },
];

export const useNote = () => {
  const [sections, setSections] = useState(INITIAL_SECTIONS);

  const updateSection = useCallback(
    (id: string, text: string) => {
      setSections((prev) => {
        sections;
      });
    },
    [sections]
  );
};
