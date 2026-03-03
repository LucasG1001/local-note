import styles from './FileExplorer.module.css';
import TreeItem from './TreeItem';
import { normalizedMockData } from './types';
import useFileExplorer from './hook/useFileExplorer';
import { useEffect } from 'react';

const FileExplorer = () => {
  const {
    addItem,
    handleCollapseAll,
    collapseKey,
    fileSystem,
    setFolderId,
    moveItem,
  } = useFileExplorer({ initialState: normalizedMockData });

  useEffect(() => {
    const allowDrag = (e: Event) => {
      e.preventDefault();
    };

    // Usamos document em vez de window, e false para a fase de bubbling
    document.addEventListener('dragenter', allowDrag, false);
    document.addEventListener('dragover', allowDrag, false);

    return () => {
      document.removeEventListener('dragenter', allowDrag);
      document.removeEventListener('dragover', allowDrag);
    };
  }, []);

  const handleGlobalDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Libera o sobrevoo na área inteira
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div
      className={styles.container}
      onDragOver={handleGlobalDrag}
      onDragEnter={handleGlobalDrag}
    >
      <div className={styles.header}>
        <span className={styles.title}>EXPLORER</span>
        <div className={styles.actions}>
          <button onClick={() => addItem('file')}>📄+</button>
          <button onClick={() => addItem('folder')}>📁+</button>
          <button onClick={handleCollapseAll}>收</button>
        </div>
      </div>

      <div className={styles.treeContent} key={collapseKey}>
        {fileSystem.rootIds.map((rootId) => (
          <TreeItem
            key={rootId}
            nodeId={rootId}
            nodes={fileSystem.nodes}
            isAllCollapsed={false}
            setFolderId={setFolderId}
            moveItem={moveItem}
          />
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
