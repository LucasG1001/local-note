// types.ts

export interface NormalizedFileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null; // Saber quem é o pai facilita muito depois
  childrenIds: string[]; // Agora guardamos apenas as referências (IDs)
}

export interface FileExplorerState {
  nodes: Record<string, NormalizedFileNode>;
  rootIds: string[];
}

export const normalizedMockData: FileExplorerState = {
  nodes: {
    '1': {
      id: '1',
      name: 'windows',
      type: 'folder',
      parentId: null,
      childrenIds: ['2', '5'],
    },
    '2': {
      id: '2',
      name: 'security',
      type: 'folder',
      parentId: '1',
      childrenIds: ['3', '4'],
    },
    '3': {
      id: '3',
      name: 'configurarFirewall.ts',
      type: 'file',
      parentId: '2',
      childrenIds: [],
    },
    '4': {
      id: '4',
      name: 'antivirus.ts',
      type: 'file',
      parentId: '2',
      childrenIds: [],
    },
    '5': {
      id: '5',
      name: 'system32.dll',
      type: 'file',
      parentId: '1',
      childrenIds: [],
    },
    '6': {
      id: '6',
      name: 'package.json',
      type: 'file',
      parentId: null,
      childrenIds: [],
    },
  },
  rootIds: ['1', '6'],
};
