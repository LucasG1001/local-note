// TreeItem.tsx
import React, { useState, useEffect } from 'react';
import styles from './FileExplorer.module.css';
import { NormalizedFileNode } from './types';

interface TreeItemProps {
  nodeId: string;
  nodes: Record<string, NormalizedFileNode>;
  isAllCollapsed: boolean;
  setFolderId: (id: string | null) => void;
  moveItem: (draggedId: string, targetFolderId: string | null) => void; // <-- Nova prop
}

const TreeItem: React.FC<TreeItemProps> = ({
  nodeId,
  nodes,
  isAllCollapsed,
  setFolderId,
  moveItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false); // Estado para o feedback visual

  const node = nodes[nodeId];

  useEffect(() => {
    if (isAllCollapsed) setIsOpen(false);
  }, [isAllCollapsed]);

  if (!node) return null;

  const isFolder = node.type === 'folder';

  // Quando começo a arrastar este item:
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // É OBRIGATÓRIO usar text/plain e garantir que seja string
    e.dataTransfer.setData('text/plain', String(node.id));
    e.dataTransfer.effectAllowed = 'move';
    console.log('Drag started:', node.name);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Isso permite o drop!
    e.dataTransfer.dropEffect = 'move';

    if (isFolder) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // O enter também precisa do preventDefault
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (isFolder) {
      // Puxando EXATAMENTE a mesma chave que salvamos no Start
      const draggedId = e.dataTransfer.getData('text/plain');

      if (draggedId && draggedId !== node.id) {
        console.log(`Movendo ${draggedId} para dentro de ${node.id}`);
        moveItem(draggedId, node.id);
        setIsOpen(true);
      }
    }
  };

  return (
    <div className={styles.itemWrapper}>
      <div
        className={`${styles.item} ${isDragOver ? styles.dragOver : ''}`}
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (isFolder) {
            setIsOpen(!isOpen);
            setFolderId(node.id);
          }
        }}
        style={{ paddingLeft: '12px', cursor: 'grab' }} // cursor grab indica que pode pegar
      >
        <div
          style={{
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isFolder && (
            <span
              className={`${styles.arrow} ${isOpen ? styles.arrowDown : ''}`}
            >
              ▶
            </span>
          )}
          <span className={isFolder ? styles.folderIcon : styles.fileIcon}>
            {isFolder ? '📁' : '📄'}
          </span>
          {node.name}
        </div>
      </div>

      {isFolder && isOpen && node.childrenIds.length > 0 && (
        <div className={styles.children}>
          {node.childrenIds.map((childId) => (
            <TreeItem
              key={childId}
              nodeId={childId}
              nodes={nodes}
              isAllCollapsed={isAllCollapsed}
              setFolderId={setFolderId}
              moveItem={moveItem} // <-- Passa a função para os filhos
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeItem;
