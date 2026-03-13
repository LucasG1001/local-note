import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import Quill from 'quill';

import 'quill/dist/quill.snow.css';
import 'highlight.js/styles/atom-one-dark.css';
import styles from './Editor.module.css';

if (typeof window !== 'undefined') {
    (window as any).hljs = hljs;
}



interface EditorProps {
    value?: string;
    onChange?: (content: string) => void;
}

const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);

    const TOOLBAR_OPTIONS = [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'code-block'], // 'code-block' aqui
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link', 'image'],
        ['clean'],
    ];

    useEffect(() => {
        if (containerRef.current && !quillRef.current) {
            const quill = new Quill(containerRef.current, {
                theme: 'snow',
                modules: {
                    syntax: {
                        hljs,
                    },
                    toolbar: TOOLBAR_OPTIONS,
                },
            });

            quillRef.current = quill;

            if (value) {
                quill.clipboard.dangerouslyPasteHTML(value);
            }

            quill.on('text-change', () => {
                const html = quill.root.innerHTML;
                if (onChange) onChange(html);
            });
        }
    }, []);

    return (
        <div className={styles.container}>
            {/* Removi a tag <style> daqui de dentro */}
            <div ref={containerRef} className={styles.editor} />
        </div>
    );
};

export default Editor;