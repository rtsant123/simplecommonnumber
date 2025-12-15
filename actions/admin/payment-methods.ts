"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { paymentMethodSchema } from "@/lib/validations/admin";
import { handleError, AuthenticationError, AuthorizationError } from "@/lib/errors";
import { uploadImage } from "@/lib/file-upload";
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

export async function createPaymentMethod(formData: FormData) {
  try {
    await requireAdmin();

    const qrImage = formData.get("qrImage") as File;
    if (!qrImage) {
      return { error: "QR code image is required" };
    }

    // Upload QR image
    const { fileUrl } = await uploadImage(qrImage, "payment-qr");

    const data = {
      name: formData.get("name") as string,
      upiId: formData.get("upiId") as string,
      description: formData.get("description") as string,
      isActive: formData.get("isActive") === "true",
    };

    const validatedFields = paymentMethodSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0]?.message || "Invalid input",
      };
    }

    await prisma.paymentMethod.create({
      data: {
        ...validatedFields.data,
        qrImageUrl: fileUrl,
      },
    });

    revalidatePath("/admin/payment-methods");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function updatePaymentMethod(id: string, formData: FormData) {
  try {
    await requireAdmin();

    const qrImage = formData.get("qrImage") as File | null;
    let qrImageUrl: string | undefined;

    if (qrImage && qrImage.size > 0) {
      const { fileUrl } = await uploadImage(qrImage, "payment-qr");
      qrImageUrl = fileUrl;
    }

    const data = {
      name: formData.get("name") as string,
      upiId: formData.get("upiId") as string,
      description: formData.get("description") as string,
      isActive: formData.get("isActive") === "true",
    };

    const validatedFields = paymentMethodSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0]?.message || "Invalid input",
      };
    }

    await prisma.paymentMethod.update({
      where: { id },
      data: {
        ...validatedFields.data,
        ...(qrImageUrl && { qrImageUrl }),
      },
    });

    revalidatePath("/admin/payment-methods");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function deletePaymentMethod(id: string) {
  try {
    await requireAdmin();

    await prisma.paymentMethod.delete({
      where: { id },
    });

    revalidatePath("/admin/payment-methods");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function togglePaymentMethodStatus(id: string) {
  try {
    await requireAdmin();

    const method = await prisma.paymentMethod.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!method) {
      return { error: "Payment method not found" };
    }

    await prisma.paymentMethod.update({
      where: { id },
      data: { isActive: !method.isActive },
    });

    revalidatePath("/admin/payment-methods");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}
