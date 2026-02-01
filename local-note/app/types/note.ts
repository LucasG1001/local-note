export interface Note {
  id: number;
  titulo: string;
  tags: string[];
  content: string;
  categoria: 'code' | 'contact' | 'event' | 'general';
}
