import React, { useState, useEffect } from 'react';
import styles from './FileExplorer.module.css';
import { NormalizedFileNode } from './types';

interface TreeItemProps {
  nodeId: string;
  nodes: Record<string, NormalizedFileNode>;
  isAllCollapsed: boolean;
  setFolderId: (id: string | null) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({
  nodeId,
  nodes,
  isAllCollapsed,
  setFolderId,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const node = nodes[nodeId];

  useEffect(() => {
    if (isAllCollapsed) setIsOpen(false);
  }, [isAllCollapsed]);

  if (!node) return null;

  const isFolder = node.type === 'folder';

  return (
    <div className={styles.itemWrapper}>
      <div
        className={styles.item}
        onClick={() => {
          if (isFolder) {
            setIsOpen(!isOpen);
            setFolderId(node.id);
          }
        }}
        style={{ paddingLeft: '12px', cursor: 'pointer' }}
      >
        {isFolder && (
          <span className={`${styles.arrow} ${isOpen ? styles.arrowDown : ''}`}>
            ▶
          </span>
        )}
        <span className={isFolder ? styles.folderIcon : styles.fileIcon}>
          {isFolder ? '📁' : '📄'}
        </span>
        {node.name}
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeItem;
