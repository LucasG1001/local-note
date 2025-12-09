"use client";
import Prism from "prismjs";
import "prismjs/components/prism-javascript"; // ou a linguagem que quiser
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/themes/prism-tomorrow.css";
import React, { useEffect, useRef } from "react";
import Editor from "react-simple-code-editor";
import Line from "../components/line/Line";
import Menu from "./Menu/Menu";
import styles from "./Note.module.css";

const Note = () => {
  const [sections, setSections] = React.useState([
    {
      id: 1,
      title: "Introdução",
      text: "Bem-vindo ao documento! Aqui você encontrará uma visão geral do conteúdo.",
      type: "text",
    },
    {
      id: 2,
      title: "Resumo",
      text: "Este é um pequeno resumo das principais ideias apresentadas na seção anterior.",
      type: "text",
    },
    {
      id: 3,
      title: "Lista de Tarefas",
      text: "- Comprar itens\n- Revisar o código\n- Preparar apresentação",
      type: "text",
    },
    {
      id: 4,
      title: "Código Exemplo",
      text: "function soma(a, b) {\n  return a + b;\n}",
      type: "code",
    },
    {
      id: 5,
      title: "Notas Finais",
      text: "Lembre-se de validar os dados antes de enviar e revisar o layout.",
      type: "text",
    },
  ]);

  const editorRefs = useRef({});

  const handleChange = ({ value, id }: { value: string; id: number }) => {
    let currentMode = sections.find((item) => item.id === Number(id))?.type;

    console.log(currentMode);
    if (!currentMode) return;
    if (value.includes("'''")) {
      value = value.replace("'''", "");
      if (currentMode === "code") currentMode = "text";
      else currentMode = "code";
    }

    const newSections = sections.map((item) => {
      if (item.id === Number(id)) {
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
      handleDelete(sections[index].id);
    } else if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      focusEditor(sections[sections.length - 1].id);
      const newSections = [...sections];

      newSections.splice(index + 1, 0, {
        id: sections.length + 1,
        title: "Novo item",
        text: "",
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

    return "normal";
  }

  function focusEditor(id: number) {
    const wrapper = editorRefs.current[id];
    if (!wrapper) return;

    const textarea = wrapper.querySelector("textarea");
    if (textarea) textarea.focus();
  }

  return (
    <div className={styles.container}>
      <Menu />
      <div className={styles.content}>
        {sections.map((item, index) => (
          <div
            key={item.id}
            ref={(el) => {
              if (el) editorRefs.current[item.id] = el;
            }}
            className="editor-wrapper"
          >
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
