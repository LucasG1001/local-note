// useFileExplorer.ts
import React from 'react';
import { FileExplorerState, NormalizedFileNode } from '../types';

interface UseFileExplorerProps {
  initialState: FileExplorerState;
}

const useFileExplorer = ({ initialState }: UseFileExplorerProps) => {
  const [collapseKey, setCollapseKey] = React.useState(0);
  const [folderId, setFolderId] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const [fileSystem, setFileSystem] =
    React.useState<FileExplorerState>(initialState);

  const handleCollapseAll = () => {
    setCollapseKey((prev) => prev + 1);
    setSelectedId(null);
  };

  const addItem = (type: 'file' | 'folder') => {
    const newId = crypto.randomUUID();
    const newNode: NormalizedFileNode = {
      id: newId,
      name: type === 'file' ? 'Nova Nota.ts' : 'Nova Pasta',
      type,
      parentId: folderId,
      childrenIds: [],
    };

    setFileSystem((prev) => {
      // 1. Adicionamos o novo nó diretamente no "dicionário"
      const newNodes = { ...prev.nodes, [newId]: newNode };
      const newRootIds = [...prev.rootIds];

      if (folderId) {
        // 2a. Se tem uma pasta selecionada, atualizamos o pai com o novo ID do filho
        const parentNode = newNodes[folderId];
        newNodes[folderId] = {
          ...parentNode,
          childrenIds: [...parentNode.childrenIds, newId],
        };
      } else {
        // 2b. Se não tem pasta selecionada, vai para a raiz
        newRootIds.push(newId);
      }

      return { nodes: newNodes, rootIds: newRootIds };
    });
  };

  return {
    collapseKey,
    handleCollapseAll,
    fileSystem,
    setFileSystem,
    selectedId,
    setSelectedId,
    addItem,
    folderId,
    setFolderId,
  };
};

export default useFileExplorer;
