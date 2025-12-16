"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";
import { Note, NoteSection, Tag } from "@prisma/client";

export type SectionType = "text" | "code";

export type CreateNoteDTO = {
  title: string;
  tags: { name: string }[];
  sections: {
    text: string;
    type: SectionType;
  }[];
};

export type UpdateNoteDTO = {
  id: string;
  title?: string;
  sections?: {
    id: string;
    text?: string;
    type?: SectionType;
  }[];
  tags?: {
    id?: string;
    name: string;
  }[];
};

export type NoteResponseDTO = Note & { tags: Tag[]; sections: NoteSection[] };

export async function createNote(data: CreateNoteDTO) {
  const note = await prisma.note.create({
    data: {
      title: data.title,
      tags: {
        create: data.tags,
      },
      sections: {
        create: data.sections,
      },
    },
  });

  revalidatePath("/");
}

export async function addSectionToNote(
  noteId: string,
  section: { text: string; type: SectionType }
) {
  const noteExists = await prisma.note.findUnique({
    where: { id: noteId },
  });

  if (!noteExists) {
    throw new Error("Note not found");
  }

  const note = await prisma.note.update({
    where: { id: noteId },
    data: {
      sections: {
        create: {
          text: section.text,
          type: section.type,
        },
      },
    },
    include: { sections: true },
  });

  return note.sections;
}

export async function UpdateNote(data: UpdateNoteDTO) {
  const { id, title, sections, tags } = data;

  if (!id) throw new Error("Note id is required");

  if (title) {
    await prisma.note.update({
      where: { id },
      data: { title },
    });
  }

  if (sections?.length) {
    await prisma.$transaction(
      sections.map((section) =>
        prisma.noteSection.update({
          where: { id: section.id },
          data: {
            ...(section.text !== undefined && { text: section.text }),
            ...(section.type !== undefined && { type: section.type }),
          },
        })
      )
    );
  }

  if (tags) {
    await prisma.tag.deleteMany({
      where: { noteId: id },
    });

    await prisma.tag.createMany({
      data: tags.map((tag) => ({
        name: tag.name,
        noteId: id,
      })),
    });
  }

  revalidatePath("/");
}

export async function getNotes(): Promise<NoteResponseDTO[]> {
  return prisma.note.findMany({
    include: {
      tags: true,
      sections: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
