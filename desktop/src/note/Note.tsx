import React, { useEffect, useRef } from "react";
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
    {
      id: 1,
      title: "Introdução",
      text: "Bem-vindo ao documento! Aqui você encontrará uma visão geral do conteúdo.",
      mode: "normal",
      type: "text",
    },
    {
      id: 2,
      title: "Resumo",
      text: "Este é um pequeno resumo das principais ideias apresentadas na seção anterior.",
      mode: "edit",
      type: "text",
    },
    {
      id: 3,
      title: "Lista de Tarefas",
      text: "- Comprar itens\n- Revisar o código\n- Preparar apresentação",
      mode: "normal",
      type: "list",
    },
    {
      id: 4,
      title: "Código Exemplo",
      text: "function soma(a, b) {\n  return a + b;\n}",
      mode: "normal",
      type: "code",
    },
    {
      id: 5,
      title: "Notas Finais",
      text: "Lembre-se de validar os dados antes de enviar e revisar o layout.",
      mode: "normal",
      type: "text",
    },
  ]);

  const editorRefs = useRef({});

  useEffect(() => {
    focusEditor(sections[sections.length - 1].id);
  }, [sections]);

  const handleChange = ({ value, id }: { value: string; id: number }) => {
    let currentMode = sections.find((item) => item.id === Number(id))?.mode;

    if (!currentMode) return;
    if (value.includes("'''")) {
      value = value.replace("'''", "");
      if (currentMode === "codeMode") currentMode = "normal";
      else currentMode = "codeMode";
    }

    const newSections = sections.map((item) => {
      if (item.id === Number(id)) {
        return {
          ...item,
          text: value,
          mode: currentMode,
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
      const newSections = [...sections];

      newSections.splice(index + 1, 0, {
        id: sections.length + 1,
        title: "Novo item",
        text: "",
        mode: "normal",
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
                const lang = detectLanguage(code);
                if (lang === "normal") return code;
                return Prism.highlight(code, Prism.languages[lang], lang);
              }}
              padding={10}
              className={styles.codeEditor}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
            <Line />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Note;
