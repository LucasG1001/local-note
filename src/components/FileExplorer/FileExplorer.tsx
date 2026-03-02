import styles from './FileExplorer.module.css';
import TreeItem from './TreeItem';
import { normalizedMockData } from './types';
import useFileExplorer from './hook/useFileExplorer';

const FileExplorer = () => {
  const { addItem, handleCollapseAll, collapseKey, fileSystem, setFolderId } =
    useFileExplorer({ initialState: normalizedMockData });

  return (
    <div className={styles.container}>
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
          />
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
