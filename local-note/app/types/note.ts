export interface Block {
  id: string;
  type: 'text' | 'code';
  language?: string;
  value: string;
}

export interface Note {
  id: number;
  titulo: string;
  tags: string[];
  content: Block[];
  categoria: 'code' | 'contact' | 'event' | 'general';
}
