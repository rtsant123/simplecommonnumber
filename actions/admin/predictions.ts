"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleError, AuthenticationError, AuthorizationError } from "@/lib/errors";
import { generatePredictions, savePredictions, generateAllPredictions } from "@/lib/predictions";
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

export async function generatePredictionsForHouse(houseId: string, date?: string) {
  try {
    await requireAdmin();

    const targetDate = date ? new Date(date) : new Date();

    const predictions = await generatePredictions(houseId, targetDate);
    await savePredictions(houseId, targetDate, predictions);

    revalidatePath("/admin/predictions");
    revalidatePath("/predictions");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function generatePredictionsForAllHouses(date?: string) {
  try {
    await requireAdmin();

    const targetDate = date ? new Date(date) : new Date();
    await generateAllPredictions(targetDate);

    revalidatePath("/admin/predictions");
    revalidatePath("/predictions");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function deletePrediction(id: string) {
  try {
    await requireAdmin();

    await prisma.prediction.delete({
      where: { id },
    });

    revalidatePath("/admin/predictions");
    revalidatePath("/predictions");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}
