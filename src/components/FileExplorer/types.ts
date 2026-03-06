// types.ts

export interface EditorBlock {
  id: string;
  type: 'h1' | 'p' | 'li' | 'image' | 'code';
  content: string;
}

export interface NormalizedFileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: EditorBlock[]; // Somente para arquivos
  parentId: string | null;
  childrenIds: string[];
}

export interface FileExplorerState {
  nodes: Record<string, NormalizedFileNode>;
  selectedNodeId: string | null;
  expendedFolderIds: string[];
  rootIds: string[];
}

export const normalizedMockData: FileExplorerState = {
  nodes: {
    '7': {
      id: '7',
      name: 'meu-projeto-web',
      type: 'folder',
      parentId: null,
      childrenIds: ['8', '11'],
    },
    '8': {
      id: '8',
      name: 'src',
      type: 'folder',
      parentId: '7',
      childrenIds: ['9', '10'],
    },
    '9': {
      id: '9',
      name: 'App.tsx',
      type: 'file',
      parentId: '8',
      content: [
        {
          id: 'b1',
          type: 'code',
          content: 'const App = () => { return <div>Hello World</div> }',
        },
      ],
      childrenIds: [],
    },
    '10': {
      id: '10',
      name: 'styles.css',
      type: 'file',
      parentId: '8',
      content: [
        {
          id: 'b2',
          type: 'p',
          content: 'body { background: #000; color: #fff; }',
        },
      ],
      childrenIds: [],
    },
    '11': {
      id: '11',
      name: 'README.md',
      type: 'file',
      parentId: '7',
      content: [
        { id: 'b3', type: 'h1', content: 'Documentação do Projeto' },
        {
          id: 'b4',
          type: 'p',
          content: 'Este projeto usa React e TypeScript.',
        },
      ],
      childrenIds: [],
    },

    '12': {
      id: '12',
      name: 'Estudos',
      type: 'folder',
      parentId: null,
      childrenIds: ['13'],
    },
    '13': {
      id: '13',
      name: 'React Design Patterns.txt',
      type: 'file',
      parentId: '12',
      content: [
        { id: 'b5', type: 'h1', content: 'Compound Components' },
        {
          id: 'b6',
          type: 'p',
          content: 'Um padrão poderoso para criar componentes flexíveis.',
        },
        { id: 'b7', type: 'li', content: 'Melhora a legibilidade' },
        { id: 'b8', type: 'li', content: 'Facilita a manutenção' },
      ],
      childrenIds: [],
    },

    '14': {
      id: '14',
      name: 'Ideias de Apps.txt',
      type: 'file',
      parentId: null,
      content: [
        { id: 'b9', type: 'h1', content: 'Lista de Ideias' },
        {
          id: 'b10',
          type: 'p',
          content: '1. App de notas com blocos (em andamento 🚀)',
        },
      ],
      childrenIds: [],
    },
  },
  selectedNodeId: null,
  rootIds: ['7', '12', '14'],
  expendedFolderIds: ['7', '12'],
};
