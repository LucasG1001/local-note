export interface Note {
  id: string;
  title: string;
  content: string;
  ai_description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewNote {
  title: string;
  content: string;
}
