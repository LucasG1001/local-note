// app/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type NoteSection = {
  id?: string; // Opcional na criação
  title: string;
  text: string;
  type: "text" | "code";
};

export type Note = {
  id: string;
  title: string;
  tags: string[];
  sections: NoteSection[];
};

export async function createNote(data: Omit<Note, "id">) {
  await prisma.note.create({
    data: {
      title: data.title,
      tags: {
        create: data.tags.map((tag) => ({ name: tag })),
      },
      sections: {
        create: data.sections.map((section) => ({
          title: section.title,
          text: section.text,
          type: section.type,
        })),
      },
    },
  });

  revalidatePath("/");
}

// --- READ ---
export async function getNotes(): Promise<Note[]> {
  const notes = await prisma.note.findMany({
    include: {
      tags: true,
      sections: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Mapeia do formato do Banco para o seu Tipo Note
  return notes.map((n) => ({
    id: n.id,
    title: n.title,
    tags: n.tags.map((t) => t.name),
    sections: n.sections.map((s) => ({
      id: s.id,
      title: s.title,
      text: s.text,
      type: s.type as "text" | "code",
    })),
  }));
}

export async function updateNote(id: string, data: Omit<Note, "id">) {
  await prisma.$transaction(async (tx) => {
    await tx.note.update({
      where: { id },
      data: { title: data.title },
    });

    await tx.tag.deleteMany({ where: { noteId: id } });
    if (data.tags.length > 0) {
      await tx.tag.createMany({
        data: data.tags.map((tag) => ({ name: tag, noteId: id })),
      });
    }

    await tx.noteSection.deleteMany({ where: { noteId: id } });
    if (data.sections.length > 0) {
      await tx.noteSection.createMany({
        data: data.sections.map((sec) => ({
          title: sec.title,
          text: sec.text,
          type: sec.type,
          noteId: id,
        })),
      });
    }
  });

  revalidatePath("/");
}

export async function deleteNote(id: string) {
  await prisma.note.delete({
    where: { id },
  });

  revalidatePath("/");
}
