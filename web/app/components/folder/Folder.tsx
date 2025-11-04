'use client';
import React from 'react';
import styles from './Folder.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  createFolder,
  deleteFolder,
  updateFolder,
} from '@/app/actions/folders/folderActions';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';

interface Folder {
  id: string;
  name: string;
}

interface FolderProps {
  folders: Folder[];
  folderId: string;
  setFolderId: React.Dispatch<React.SetStateAction<string>>;
}
const Folder = ({ folders, folderId, setFolderId }: FolderProps) => {
  React.useEffect(() => {
    setFolderId(folders[0].id);
  }, []);

  const handleUpdate = async (id: string, data: Partial<Folder>) => {
    clearTimeout((window as any)._updateTimer);
    (window as any)._updateTimer = setTimeout(async () => {
      await updateFolder(id, data);
    }, 5000);
  };

  function handleSelect(folderId: string) {
    setFolderId(folderId);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Folders</span>{' '}
        <button type="button" className={styles.button} onClick={createFolder}>
          +
        </button>
      </div>
      {folders.map((folder) => (
        <div
          key={folder.id}
          className={`${styles.folder} ${
            folderId === folder.id && styles.active
          }`}
          onClick={() => handleSelect(folder.id)}
        >
          <input
            className={styles.folderText}
            type="text"
            value={folder.name}
            onChange={(e) => handleUpdate(folder.id, { name: e.target.value })}
          />
          <button
            onClick={() => deleteFolder(folder.id)}
            className={styles.button}
          >
            <FontAwesomeIcon icon={faTrashCan} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Folder;
