'use client';
import React, { useState, useMemo } from 'react';
import { NoteDetail } from './NoteDetail';
import Tags from './Tags';
import SearchBar from './SearchBar';
import { Note } from '../types/note';
import { useNotes } from '../context/NoteContext';

export default function NoteManager() {
  const { notes, selectedNote, selectNote } = useNotes();

  return (
    <div
      className="min-h-screen p-8 text-gray-100"
      style={{ backgroundColor: '#131314' }}
    >
      {/* <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} /> */}

      <div className="max-w-4xl mx-auto grid grid-cols-1 mt-8 gap-4">
        {notes.map((item) => (
          <div
            onClick={() => selectNote(item)}
            key={item.id}
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
            <Tags item={item} />
          </div>
        ))}
      </div>

      {selectedNote && <NoteDetail />}
    </div>
  );
}
