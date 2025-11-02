'use server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getFolders(): Promise<Prisma.Folder[]> {
  return prisma.folder.findMany();
}

export async function createFolder() {
  const folder = await prisma.folder.create({ data: { name: 'Nova pasta' } });
  revalidatePath('/notes');
  return folder;
}

export async function deleteFolder(id: string) {
  await prisma.folder.delete({ where: { id } });
  revalidatePath('/notes');
}

export async function updateFolder(id: string, data: Prisma.FolderUpdateInput) {
  const folder = await prisma.folder.update({ where: { id }, data });
  revalidatePath('/notes');
  return folder;
}
