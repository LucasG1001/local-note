// "use server";

// import { PrismaClient, Task } from "@prisma/client";
// import { revalidatePath } from "next/cache";

// export async function createTask(task: Task) {
//   await prisma.task.create({ data: task });
//   revalidatePath("/");
// }

// export async function deleteTask(id: string) {
//     await prisma.task.delete({ where: { id } });
//     revalidatePath("/");
// }

// export async function getTasks() {
//     return await prisma.task.findMany();
// }
