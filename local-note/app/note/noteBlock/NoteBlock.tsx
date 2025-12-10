import { useEffect, useRef } from "react";
import Editor from "react-simple-code-editor";

interface NoteBlockProps {
  id: number;
  title: string;
  text: string;
  type: string;
  shouldFocus?: boolean;
}

export default function NoteBlock({
  id,
  title,
  text,
  type,
  shouldFocus,
}: NoteBlockProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldFocus && editorRef.current) {
      const textarea = editorRef.current.querySelector("textarea");
      textarea?.focus();
    }
  }, [shouldFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    if (e.key === "Delete") {
    }
  };
}
