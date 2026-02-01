import { Search } from 'lucide-react';
import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

const SearchBar = ({ searchTerm, setSearchTerm }: SearchBarProps) => {
  return (
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
  );
};

export default SearchBar;
