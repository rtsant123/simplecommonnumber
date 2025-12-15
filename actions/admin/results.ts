"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resultSchema, bulkResultSchema } from "@/lib/validations/admin";
import { handleError, AuthenticationError, AuthorizationError } from "@/lib/errors";
import { revalidatePath } from "next/cache";
import Papa from "papaparse";

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

export async function createResult(formData: FormData) {
  try {
    await requireAdmin();

    const data = {
      houseId: formData.get("houseId") as string,
      date: formData.get("date") as string,
      firstRound: formData.get("firstRound") ? parseInt(formData.get("firstRound") as string) : null,
      secondRound: formData.get("secondRound") ? parseInt(formData.get("secondRound") as string) : null,
    };

    const validatedFields = resultSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0]?.message || "Invalid input",
      };
    }

    await prisma.result.create({
      data: {
        houseId: validatedFields.data.houseId,
        date: new Date(validatedFields.data.date),
        firstRound: validatedFields.data.firstRound,
        secondRound: validatedFields.data.secondRound,
      },
    });

    revalidatePath("/admin/results");
    revalidatePath("/results");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateResult(id: string, formData: FormData) {
  try {
    await requireAdmin();

    const data = {
      houseId: formData.get("houseId") as string,
      date: formData.get("date") as string,
      firstRound: formData.get("firstRound") ? parseInt(formData.get("firstRound") as string) : null,
      secondRound: formData.get("secondRound") ? parseInt(formData.get("secondRound") as string) : null,
    };

    const validatedFields = resultSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0]?.message || "Invalid input",
      };
    }

    await prisma.result.update({
      where: { id },
      data: {
        houseId: validatedFields.data.houseId,
        date: new Date(validatedFields.data.date),
        firstRound: validatedFields.data.firstRound,
        secondRound: validatedFields.data.secondRound,
      },
    });

    revalidatePath("/admin/results");
    revalidatePath("/results");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteResult(id: string) {
  try {
    await requireAdmin();

    await prisma.result.delete({
      where: { id },
    });

    revalidatePath("/admin/results");
    revalidatePath("/results");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function bulkUploadResults(formData: FormData) {
  try {
    await requireAdmin();

    const file = formData.get("file") as File;
    const houseId = formData.get("houseId") as string;

    if (!file) {
      return { error: "Please select a CSV file" };
    }

    if (!houseId) {
      return { error: "Please select a house" };
    }

    const text = await file.text();

    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const parsedResults = results.data as Array<{
              date: string;
              firstRound?: string;
              secondRound?: string;
            }>;

            const bulkData = parsedResults.map((row) => ({
              date: row.date,
              firstRound: row.firstRound ? parseInt(row.firstRound) : null,
              secondRound: row.secondRound ? parseInt(row.secondRound) : null,
            }));

            const validatedFields = bulkResultSchema.safeParse({
              houseId,
              results: bulkData,
            });

            if (!validatedFields.success) {
              resolve({
                error: validatedFields.error.errors[0]?.message || "Invalid CSV data",
              });
              return;
            }

            // Delete existing results for this house in the date range
            const dates = validatedFields.data.results.map(r => new Date(r.date));
            await prisma.result.deleteMany({
              where: {
                houseId,
                date: { in: dates },
              },
            });

            // Create new results
            await prisma.result.createMany({
              data: validatedFields.data.results.map((r) => ({
                houseId,
                date: new Date(r.date),
                firstRound: r.firstRound,
                secondRound: r.secondRound,
              })),
            });

            revalidatePath("/admin/results");
            revalidatePath("/results");
            resolve({ success: true, count: bulkData.length });
          } catch (error) {
            resolve(handleError(error));
          }
        },
        error: (error) => {
          resolve({ error: `CSV parsing error: ${error.message}` });
        },
      });
    });
  } catch (error) {
    return handleError(error);
  }
}
