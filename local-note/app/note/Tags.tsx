import React from 'react';
import { X, Copy, Check, Terminal, Tag } from 'lucide-react';

interface InfoCard {
  id: number;
  titulo: string;
  tags: string[];
  content: string;
  categoria: 'code' | 'contact' | 'event' | 'general';
}

interface TagsProps {
  item: InfoCard | null;
}

const Tags = ({ item }: TagsProps) => {
  if (!item) return null;
  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-3 text-gray-500">
        <Tag size={14} />
        <span className="text-xs font-bold uppercase">Tags</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="text-[11px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md border border-blue-500/20"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Tags;
