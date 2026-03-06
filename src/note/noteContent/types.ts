import { EditorBlock } from '../../components/FileExplorer/types';

export type BlockType = 'p' | 'h1' | 'h2' | 'h3' | 'li' | 'blockquote' | 'code';

export interface SlashCommand {
  label: string;
  description: string;
  type: BlockType;
  icon: string;
}

export interface SlashMenuState {
  blockId: string;
  query: string;
  visible: boolean;
}

export const SLASH_MENU_CLOSED: SlashMenuState = {
  blockId: '',
  query: '',
  visible: false,
};

export const BLOCK_PLACEHOLDERS: Record<BlockType, string> = {
  p: "Digite '/' para comandos",
  h1: 'Título 1',
  h2: 'Título 2',
  h3: 'Título 3',
  li: 'Item da lista',
  blockquote: 'Citação',
  code: 'Código',
};

export const SLASH_COMMANDS: SlashCommand[] = [
  { label: 'Texto', description: 'Parágrafo simples', type: 'p', icon: '¶' },
  { label: 'Título 1', description: 'Seção grande', type: 'h1', icon: 'H1' },
  { label: 'Título 2', description: 'Seção média', type: 'h2', icon: 'H2' },
  { label: 'Título 3', description: 'Seção pequena', type: 'h3', icon: 'H3' },
  { label: 'Lista', description: 'Item com marcador', type: 'li', icon: '•' },
  {
    label: 'Citação',
    description: 'Bloco de citação',
    type: 'blockquote',
    icon: '"',
  },
  {
    label: 'Código',
    description: 'Bloco de código',
    type: 'code',
    icon: '</>',
  },
];

export const createBlock = (
  type: BlockType = 'p',
  content = '',
): EditorBlock => ({
  id: crypto.randomUUID(),
  type,
  content,
});

export const parseContent = (content: unknown): EditorBlock[] => {
  try {
    if (typeof content === 'string') {
      const parsed = JSON.parse(content || '[]');
      return Array.isArray(parsed) ? parsed : [];
    }
    if (Array.isArray(content)) return content as EditorBlock[];
  } catch {
    // silently fail
  }
  return [];
};
