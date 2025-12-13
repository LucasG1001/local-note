"use client";
import Prism from "prismjs";
import "prismjs/components/prism-javascript"; // ou a linguagem que quiser
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/themes/prism-tomorrow.css";
import React, { useEffect } from "react";
import Editor from "react-simple-code-editor";
import Menu from "./Menu/Menu";
import styles from "./Note.module.css";

type Note = {
  id: string;
  title: string;
  tags: string[];
  sections: NoteSection[];
};

type NoteSection = {
  id: string;
  title: string;
  text: string;
  type: "text" | "code";
};

const Note = () => {
  const [sections, setSections] = React.useState([
    {
      id: "fgtr5h4rt65h4rt65h",
      title: "",
      text: "",
      type: "",
    },
  ]);
  const [currentSectionId, setCurrentSectionId] = React.useState(
    sections[sections.length - 1].id
  );

  useEffect(() => {
    if (sections.length > 0) {
      const lastIndex = sections.length - 1;
      console.log(sections[lastIndex].id, currentSectionId);

      if (sections[lastIndex].id === currentSectionId) return;
      setCurrentSectionId(sections[lastIndex].id);
      const lastSection = document.getElementById(`${sections[lastIndex].id}`);
      if (lastSection) {
        const textarea = lastSection.querySelector("textarea");
        textarea?.focus();
      }
    }
  }, [sections, currentSectionId]);

  const handleChange = ({ value, id }: { value: string; id: string }) => {
    let currentMode = sections.find((item) => item.id === id)?.type;

    if (value.includes("'''")) {
      value = value.replace("'''", "");
      if (currentMode === "code") currentMode = "text";
      else currentMode = "code";
    }

    const newSections = sections.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          text: value,
          type: currentMode,
        };
      }
      return item;
    });

    setSections(newSections);
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Delete") {
      e.preventDefault();

      handleDelete(sections[index].id);
    } else if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      const newSections = [...sections];

      const newItem = {
        id: crypto.randomUUID(),
        title: "Novo item",
        text: "",
        type: "text",
      };
      setSections((prev) => [...prev, newItem]);
    }
  };

  const handleDelete = (id: string) => {
    const newSections = sections.filter((item) => item.id !== id);
    setSections(newSections);
  };

  function detectLanguage(code: string) {
    const trimmed = code.trim();

    if (/select|from|where|insert|update|delete/i.test(trimmed)) return "sql";
    if (/def |import |print\(|:\s*$/i.test(trimmed)) return "python";
    if (/const |let |function |=>/i.test(trimmed)) return "javascript";

    return "normal";
  }

  return (
    <div className={styles.container}>
      <Menu />
      <div className={styles.content}>
        {sections.map((item, index) => (
          <div key={item.id} className="editor-wrapper" id={`${item.id}`}>
            <Editor
              value={item.text}
              onValueChange={(code) =>
                handleChange({ value: code, id: item.id })
              }
              highlight={(code) => {
                if (item.type === "text") return code;
                const lang = detectLanguage(code);
                if (lang === "normal") return code;
                return Prism.highlight(code, Prism.languages[lang], lang);
              }}
              padding={10}
              className={`${styles.editor} ${styles[item.type]}`}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Note;
