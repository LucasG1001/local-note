export interface Note {
  id: number;
  titulo: string;
  tags: string[];
  content: string;
  categoria: 'code' | 'contact' | 'event' | 'general';
}

export interface Block {
  id: string;
  type: 'text' | 'code';
  language?: string;
  value: string;
}
