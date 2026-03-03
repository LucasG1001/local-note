// data.ts
export const initialData = [
  {
    id: '1',
    name: 'public',
    children: [
      { id: '1.1', name: 'index.html' },
      { id: '1.2', name: 'favicon.ico' },
    ],
  },
  {
    id: '2',
    name: 'src',
    children: [
      { id: '2.1', name: 'App.tsx' },
      { id: '2.2', name: 'index.ts' },
      { id: '2.3', name: 'styles.css' },
    ],
  },
  { id: '3', name: 'package.json' },
];

import { Tree } from 'react-arborist';

export function DraggableBox() {
  return (
    <div
      style={{
        backgroundColor: '#1e1e1e',
        color: '#ccc',
        padding: '10px',
        height: '400px',
        width: '300px',
      }}
    >
      <Tree
        initialData={initialData}
        openByDefault={true}
        width={300}
        height={400}
        indent={20}
        rowHeight={30}
        // O ID de quem pode conter outros arquivos
        childrenAccessor={(d) => d.children}
      >
        {({ node, style, dragHandle }) => (
          <div
            ref={dragHandle} // Isso permite arrastar o item
            style={{
              ...style,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              // Estilo simples de hover ou seleção
              backgroundColor: node.isSelected ? '#37373d' : 'transparent',
            }}
            onClick={() => node.toggle()}
          >
            {node.isInternal ? (node.isOpen ? '📂 ' : '📁 ') : '📄 '}
            <span style={{ marginLeft: '5px' }}>{node.data.name}</span>
          </div>
        )}
      </Tree>
    </div>
  );
}
