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

  // Dentro de useFileExplorer.ts, logo abaixo da função addItem:

  const moveItem = (draggedId: string, targetFolderId: string | null) => {
    // 1. Prevenções básicas
    if (draggedId === targetFolderId) return; // Não pode soltar nele mesmo

    setFileSystem((prev) => {
      const nodes = { ...prev.nodes };
      const rootIds = [...prev.rootIds];
      const draggedNode = nodes[draggedId];

      // Se o nó arrastado não existe, ou se o alvo não é uma pasta, cancela
      if (!draggedNode) return prev;
      if (targetFolderId && nodes[targetFolderId].type !== 'folder')
        return prev;

      // 2. Remover o ID do nó da sua localização antiga
      if (draggedNode.parentId) {
        const oldParent = nodes[draggedNode.parentId];
        nodes[draggedNode.parentId] = {
          ...oldParent,
          childrenIds: oldParent.childrenIds.filter((id) => id !== draggedId),
        };
      } else {
        const index = rootIds.indexOf(draggedId);
        if (index > -1) rootIds.splice(index, 1);
      }

      // 3. Adicionar o ID do nó na nova localização (targetFolderId)
      if (targetFolderId) {
        const newParent = nodes[targetFolderId];
        nodes[targetFolderId] = {
          ...newParent,
          childrenIds: [...newParent.childrenIds, draggedId],
        };
        // Atualiza o parentId do item arrastado
        nodes[draggedId] = { ...draggedNode, parentId: targetFolderId };
      } else {
        // Se targetFolderId for null, jogou na raiz
        rootIds.push(draggedId);
        nodes[draggedId] = { ...draggedNode, parentId: null };
      }

      return { nodes, rootIds };
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
    moveItem, // Adicionamos a função de mover itens ao retorno do hook
  };
};

export default useFileExplorer;
