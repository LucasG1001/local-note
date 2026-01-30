import React, { useState, useMemo } from 'react';
import { Search, Code, Calendar, Phone, Hash } from 'lucide-react'; // Ícones opcionais
import { DetailModal } from './DetailModal';
import Tags from './Tags';

// 1. Definição do Tipo
interface InfoCard {
  id: number;
  titulo: string;
  tags: string[];
  content: string;
  categoria: 'code' | 'contact' | 'event' | 'general';
}

const MOCK_DATA: InfoCard[] = [
  {
    id: 1,
    titulo: 'Criação de procedures',
    tags: ['procedure', 'criar', 'sqlserver', 'programação', 'sql'],
    content: 'CREATE PROCEDURE dbo.GetAllUsers AS SELECT * FROM Users GO',
    categoria: 'code',
  },
  {
    id: 2,
    titulo: 'Aniversário da Ana',
    tags: ['aniversario', 'festa', 'ana', 'familia'],
    content: 'Lembrar de comprar o bolo de chocolate que ela gosta. Dia 15/05.',
    categoria: 'event',
  },
  {
    id: 3,
    titulo: 'Suporte Técnico Internet',
    tags: ['celular', 'numero', 'ajuda', 'wifi', 'telefone'],
    content: '0800 700 0123 - Protocolo padrão: 99283',
    categoria: 'contact',
  },
  {
    id: 4,
    titulo: 'Select Simples SQL',
    tags: ['sql', 'select', 'consultar', 'banco'],
    content: 'SELECT * FROM tabela WHERE id = 1',
    categoria: 'code',
  },
];

export default function SearchManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<InfoCard | null>(null);

  // 3. Lógica do Pulo do Gato (Ranking por Tags)
  const filteredResults = useMemo(() => {
    if (!searchTerm) return MOCK_DATA;

    const searchTags = searchTerm
      .toLowerCase()
      .split(' ')
      .filter((t) => t !== '');

    return MOCK_DATA.map((item) => {
      // Conta quantos termos da busca batem com as tags do objeto
      const matches = item.tags.filter((tag) =>
        searchTags.some((s) => tag.toLowerCase().includes(s)),
      ).length;

      return { ...item, score: matches };
    })
      .filter(
        (item) =>
          item.score > 0 ||
          item.titulo.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => (b.score || 0) - (a.score || 0)); // Rankeia pelo score
  }, [searchTerm]);

  return (
    <div
      className="min-h-screen p-8 text-gray-100"
      style={{ backgroundColor: '#131314' }}
    >
      {/* Barra de Pesquisa Fixa no Topo */}
      <div className="max-w-2xl mx-auto mb-10 sticky top-0 z-10 bg-[#131314] pb-4">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Pesquise por tags (ex: sql procedure)..."
            className="w-full bg-[#1e1e1f] border border-[#333] rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 transition-all shadow-2xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResults.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group bg-[#1e1e1f] border border-[#2a2a2b] p-5 rounded-2xl hover:border-blue-500/50 hover:bg-[#252526] transition-all cursor-pointer shadow-md active:scale-[0.98]"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                {item.titulo}
              </h3>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                {item.categoria}
              </span>
            </div>

            {/* Preview do Conteúdo */}
            <p className="text-gray-400 text-sm line-clamp-2 mb-4 font-mono bg-[#131314]/50 p-2 rounded">
              {item.content}
            </p>

            <Tags item={item} />
          </div>
        ))}
      </div>

      <DetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {filteredResults.length === 0 && (
        <p className="text-center text-gray-500 mt-20">
          Nenhuma informação encontrada com essas tags.
        </p>
      )}
    </div>
  );
}
