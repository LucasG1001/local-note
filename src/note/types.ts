interface BackendNote {
  id: string;
  title: string;
  content: string;
  rank: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface Note {
  id: string;
  title: string;
  content: Block[];
  rank: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface Block {
  id: string;
  type: 'text' | 'code';
  language?: string;
  value: string;
}

interface NewNote {
  title: string;
  content: Block[] | [];
}

export type { Note, NewNote, Block, BackendNote };
