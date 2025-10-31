"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotes() {
  const notes = await prisma.note.findMany({
    orderBy: { views: "desc" },
  });
  return notes;
}

export async function createNote() {
  const note = await prisma.note.create({
    data: {
      title: "Nova nota",
      content: "",
      views: 0,
    },
  });
  revalidatePath("/notes");
  return note;
}

export async function updateNote(
  id: string,
  data: { title?: string; content?: string }
) {
  const updated = await prisma.note.update({
    where: { id },
    data,
  });
  revalidatePath("/notes");
  return updated;
}

export async function deleteNote(id: string) {
  await prisma.note.delete({ where: { id } });
  revalidatePath("/notes");
}

export async function incrementView(id: string) {
  await prisma.note.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
  revalidatePath("/notes");
}
