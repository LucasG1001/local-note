import React from "react";
import Menu from "./Menu/Menu";
import styles from "./Note.module.css";
import Line from "../components/line/Line";

const Note = () => {
  const [sections, setSections] = React.useState([
    { id: 1, text: "Olá", mode: "normal", isSelected: true },
    { id: 2, text: "Teste", mode: "normal", isSelected: false },
    { id: 3, text: "123", mode: "normal", isSelected: false },
  ]);

  const autoResize = (el) => {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let currentMode = sections.find(
      (item) => item.id === Number(e.target.id)
    )?.mode;

    if (e.target.value.includes("'''")) {
      e.target.value = e.target.value.replace("'''", "");
      if (currentMode === "codeMode") currentMode = "normal";
      else currentMode = "codeMode";
    }

    const newSections = sections.map((item) => {
      if (item.id === Number(e.target.id)) {
        return { ...item, text: e.target.value, mode: currentMode || "normal" };
      }
      return item;
    });
    setSections(newSections);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Delete") {
      handleDelete(sections[index].id);
    } else if (e.key === "Enter" && e.shiftKey) {
      const newSections = [...sections];
      newSections.splice(index + 1, 0, {
        id: sections.length + 1,
        text: "",
        mode: "normal",
        isSelected: false,
      });
      setSections(newSections);
    }
  };

  const handleDelete = (id: number) => {
    const newSections = sections.filter((item) => item.id !== id);
    setSections(newSections);
  };

  return (
    <div className={styles.container}>
      <Menu />
      <div className={styles.content}>
        {sections.map((item, index) => (
          <React.Fragment key={index}>
            <textarea
              spellCheck="false"
              key={item.id}
              id={`${item.id}`}
              onChange={handleChange}
              defaultValue={item.text}
              className={`${styles.textarea} ${styles[item.mode]}`}
              onInput={(e) => autoResize(e.target)}
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
