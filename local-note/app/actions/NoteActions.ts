"use server";

import { prisma } from "../lib/prisma";
import { Note, Block, NewNote } from "../types/note";
import { revalidatePath } from "next/cache";

export async function getNotesAction(): Promise<{
  success: boolean;
  data?: Note[];
  error?: string;
}> {
  try {
    const notes = await prisma.note.findMany({
      include: { tags: true },
      orderBy: { createdAt: "desc" },
    });

    const formattedNotes: Note[] | [] = notes.map((note) => ({
      id: note.id,
      titulo: note.titulo,
      content: JSON.parse(note.content) as Block[],
      tags: note.tags.map((t) => t.name),
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));

    return { success: true, data: formattedNotes };
  } catch (error) {
    return { success: false, error: "Falha ao buscar notas" };
  }
}

interface ActionResponse {
  success: boolean;
  data?: Note;
  error?: string;
}

export async function createNoteAction(note: NewNote): Promise<ActionResponse> {
  try {
    const newNote = await prisma.note.create({
      data: {
        titulo: note.titulo,
        content: JSON.stringify(note.content),
        tags: {
          create: note.tags.map((tagName) => ({ name: tagName })),
        },
      },
      include: { tags: true },
    });

    revalidatePath("/");
    return { success: true, data: newNote as unknown as Note };
  } catch (error) {
    console.error("Erro ao criar:", error);
    return { success: false, error: "Falha ao criar a nota." };
  }
}

export async function updateNoteAction(note: Note): Promise<ActionResponse> {
  try {
    const updatedNote = await prisma.note.update({
      where: { id: note.id },
      data: {
        titulo: note.titulo,
        content: JSON.stringify(note.content),
        tags: {
          deleteMany: {}, // Remove relações antigas
          create: note.tags.map((tagName) => ({ name: tagName })),
        },
      },
      include: { tags: true },
    });

    revalidatePath("/");
    return { success: true, data: updatedNote as unknown as Note };
  } catch (error) {
    console.error("Erro ao atualizar:", error);
    return { success: false, error: "Falha ao atualizar a nota." };
  }
}

export async function deleteNoteAction(id: string) {
  try {
    await prisma.note.delete({
      where: { id },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao eliminar." };
  }
}
