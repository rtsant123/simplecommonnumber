"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { approvePaymentSchema, rejectPaymentSchema } from "@/lib/validations/admin";
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

export async function approvePayment(formData: FormData) {
  try {
    await requireAdmin();

    const data = {
      paymentId: formData.get("paymentId") as string,
      remarks: formData.get("remarks") as string,
    };

    const validatedFields = approvePaymentSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0]?.message || "Invalid input",
      };
    }

    const payment = await prisma.payment.findUnique({
      where: { id: validatedFields.data.paymentId },
      include: { subscription: { include: { package: true } } },
    });

    if (!payment) {
      return { error: "Payment not found" };
    }

    if (payment.status !== "PENDING") {
      return { error: "Payment has already been processed" };
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + payment.subscription.package.days);

    // Update payment status
    await prisma.payment.update({
      where: { id: validatedFields.data.paymentId },
      data: {
        status: "APPROVED",
        approvedAt: now,
        remarks: validatedFields.data.remarks,
      },
    });

    // Activate subscription
    await prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: {
        status: "ACTIVE",
        startDate: now,
        endDate: endDate,
      },
    });

    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function rejectPayment(formData: FormData) {
  try {
    await requireAdmin();

    const data = {
      paymentId: formData.get("paymentId") as string,
      remarks: formData.get("remarks") as string,
    };

    const validatedFields = rejectPaymentSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0]?.message || "Invalid input",
      };
    }

    const payment = await prisma.payment.findUnique({
      where: { id: validatedFields.data.paymentId },
    });

    if (!payment) {
      return { error: "Payment not found" };
    }

    if (payment.status !== "PENDING") {
      return { error: "Payment has already been processed" };
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: validatedFields.data.paymentId },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        remarks: validatedFields.data.remarks,
      },
    });

    // Reject subscription
    await prisma.subscription.update({
      where: { id: payment.subscriptionId },
      data: {
        status: "REJECTED",
      },
    });

    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}
