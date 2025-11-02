'use client';
import React from 'react';
import { Prisma } from '@prisma/client';
import styles from './Folder.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { byPrefixAndName } from '@fortawesome/fontawesome-svg-core/import.macro';
import { createFolder } from '@/app/actions/folders/folderActions';

type Props = {
  folders: Prisma.Folder[];
};

const Folder = ({ folders }: Props) => {
  const [activeFolder, setActiveFolder] = React.useState<string | null>(null);
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
            activeFolder === folder.id && styles.active
          }`}
          onClick={() => setActiveFolder(folder.id)}
        >
          <input
            className={styles.folderText}
            type="text"
            value={folder.name}
          />
          <button>
            <FontAwesomeIcon icon={byPrefixAndName.far['trash-can']} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Folder;
