interface Note {
  id?: string;
  title: string;
  content: Block[];
  createdAt?: string;
  updatedAt?: string;
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

export type { Note, NewNote, Block };
