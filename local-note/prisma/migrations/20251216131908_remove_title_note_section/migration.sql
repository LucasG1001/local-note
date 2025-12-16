/*
  Warnings:

  - You are about to drop the column `title` on the `NoteSection` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NoteSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    CONSTRAINT "NoteSection_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_NoteSection" ("id", "noteId", "text", "type") SELECT "id", "noteId", "text", "type" FROM "NoteSection";
DROP TABLE "NoteSection";
ALTER TABLE "new_NoteSection" RENAME TO "NoteSection";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
