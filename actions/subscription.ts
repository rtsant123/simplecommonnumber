"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { subscriptionSchema } from "@/lib/validations/user";
import { handleError, AuthenticationError } from "@/lib/errors";
import { uploadImage } from "@/lib/file-upload";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new AuthenticationError();
  }
  return session.user;
}

export async function createSubscription(formData: FormData) {
  try {
    const user = await requireAuth();

    const proofImage = formData.get("proofImage") as File;
    if (!proofImage) {
      return { error: "Payment proof image is required" };
    }

    // Upload proof image
    const { fileUrl } = await uploadImage(proofImage, "payment-proofs");

    const data = {
      packageId: formData.get("packageId") as string,
      paymentMethodId: formData.get("paymentMethodId") as string,
    };

    const validatedFields = subscriptionSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0]?.message || "Invalid input",
      };
    }

    // Get package details
    const pkg = await prisma.subscriptionPackage.findUnique({
      where: { id: validatedFields.data.packageId },
    });

    if (!pkg) {
      return { error: "Invalid subscription package" };
    }

    // Check for pending subscriptions
    const pendingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: "PENDING",
      },
    });

    if (pendingSubscription) {
      return {
        error: "You already have a pending subscription. Please wait for approval.",
      };
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        packageId: validatedFields.data.packageId,
        status: "PENDING",
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        userId: user.id,
        subscriptionId: subscription.id,
        paymentMethodId: validatedFields.data.paymentMethodId,
        amount: pkg.price,
        proofImageUrl: fileUrl,
        status: "PENDING",
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/subscriptions");
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function getActiveSubscription() {
  try {
    const user = await requireAuth();

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: "ACTIVE",
        endDate: {
          gte: new Date(),
        },
      },
      include: {
        package: true,
      },
      orderBy: {
        endDate: "desc",
      },
    });

    return { subscription };
  } catch (error) {
    return handleError(error);
  }
}
