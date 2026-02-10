export interface Block {
  id: string;
  type: 'text' | 'code';
  language?: string;
  value: string;
}

export interface Note {
  id: string;
  titulo: string;
  tags: string[];
  content: Block[];
  createdAt: Date;
  updatedAt: Date;
}
