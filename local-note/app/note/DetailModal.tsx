import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Terminal, Tag } from 'lucide-react';
import Tags from './Tags';

interface InfoCard {
  id: number;
  titulo: string;
  tags: string[];
  content: string;
  categoria: 'code' | 'contact' | 'event' | 'general';
}

interface DetailModalProps {
  item: InfoCard | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 2000);
    }
  }, [copied]);

  if (!isOpen || !item) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay - Fecha ao clicar fora */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Container do Modal */}
      <div className="relative bg-[#1e1e1f] border border-[#333] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#333]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Terminal size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">
                {item.titulo}
              </h2>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                {item.categoria}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              Informação Salva
            </h3>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 text-xs px-4 py-2 rounded-lg transition-all active:scale-95 ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          <div className="bg-[#131314] p-5 rounded-2xl border border-[#2a2a2b] min-h-[180px] font-mono text-sm leading-relaxed text-blue-50 whitespace-pre-wrap ring-1 ring-white/5">
            {item.content || 'Nenhum conteúdo disponível.'}
          </div>

          <Tags item={item} />
        </div>
      </div>
    </div>
  );
};
