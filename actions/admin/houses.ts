"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { houseSchema } from "@/lib/validations/admin";
import { handleError, AuthenticationError, AuthorizationError } from "@/lib/errors";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new AuthenticationError();
  }
  if (session.user.role !== "ADMIN") {
    throw new AuthorizationError();
  }
  return session.user;
}

export async function createHouse(formData: FormData) {
  try {
    await requireAdmin();

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      isActive: formData.get("isActive") === "true",
    };

    const validatedFields = houseSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0]?.message || "Invalid input",
      };
    }

    await prisma.house.create({
      data: validatedFields.data,
    });

    revalidatePath("/admin/houses");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateHouse(id: string, formData: FormData) {
  try {
    await requireAdmin();

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      isActive: formData.get("isActive") === "true",
    };

    const validatedFields = houseSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0]?.message || "Invalid input",
      };
    }

    await prisma.house.update({
      where: { id },
      data: validatedFields.data,
    });

    revalidatePath("/admin/houses");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteHouse(id: string) {
  try {
    await requireAdmin();

    await prisma.house.delete({
      where: { id },
    });

    revalidatePath("/admin/houses");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function toggleHouseStatus(id: string) {
  try {
    await requireAdmin();

    const house = await prisma.house.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!house) {
      return { error: "House not found" };
    }

    await prisma.house.update({
      where: { id },
      data: { isActive: !house.isActive },
    });

    revalidatePath("/admin/houses");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}
