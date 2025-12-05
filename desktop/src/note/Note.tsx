import React from "react";
import Prism from "prismjs";
import Menu from "./Menu/Menu";
import styles from "./Note.module.css";
import Line from "../components/line/Line";
import Editor from "react-simple-code-editor";
import "prismjs/components/prism-javascript"; // ou a linguagem que quiser
import "prismjs/components/prism-sql";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-tomorrow.css";

const Note = () => {
  const [sections, setSections] = React.useState([
    { id: 1, text: "Olá", mode: "normal", isSelected: true, type: "text" },
    { id: 2, text: "Teste", mode: "normal", isSelected: false, type: "text" },
    { id: 3, text: "123", mode: "normal", isSelected: false, type: "text" },
  ]);

  const handleChange = ({ value, id }: { value: string; id: number }) => {
    let currentMode = sections.find((item) => item.id === Number(id))?.mode;
    console.log(value, id);

    if (value.includes("'''")) {
      value = value.replace("'''", "");
      if (currentMode === "codeMode") currentMode = "normal";
      else currentMode = "codeMode";
    }

    const newSections = sections.map((item) => {
      if (item.id === Number(id)) {
        return { ...item, text: value, mode: currentMode };
      }
      return item;
    });

    setSections(newSections);
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Delete") {
      handleDelete(sections[index].id);
    } else if (e.key === "Enter" && e.shiftKey) {
      const newSections = [...sections];
      newSections.splice(index + 1, 0, {
        id: sections.length + 1,
        text: "",
        mode: "normal",
        isSelected: false,
        type: "text",
      });
      setSections(newSections);
    }
  };

  const handleDelete = (id: number) => {
    const newSections = sections.filter((item) => item.id !== id);
    setSections(newSections);
  };

  function detectLanguage(code: string) {
    const trimmed = code.trim();

    if (/select|from|where|insert|update|delete/i.test(trimmed)) return "sql";
    if (/def |import |print\(|:\s*$/i.test(trimmed)) return "python";
    if (/const |let |function |=>/i.test(trimmed)) return "javascript";

    return "normal"; // <- nenhum match → texto normal
  }

  return (
    <div className={styles.container}>
      <Menu />
      <div className={styles.content}>
        {sections.map((item, index) => (
          <React.Fragment key={index}>
            <Editor
              value={item.text}
              onValueChange={(code) =>
                handleChange({ value: code, id: item.id })
              }
              highlight={(code) => {
                const lang = detectLanguage(code);
                if (lang === "normal") return code;
                return Prism.highlight(code, Prism.languages[lang], lang);
              }}
              padding={10}
              className={styles.codeEditor}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
            <Line />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Note;
