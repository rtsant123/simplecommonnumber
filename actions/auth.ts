"use server";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema, loginSchema } from "@/lib/validations/auth";
import { handleError, AuthenticationError } from "@/lib/errors";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const validatedFields = loginSchema.safeParse({ email, password });

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0]?.message || "Invalid input",
      };
    }

    await signIn("credentials", {
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "An authentication error occurred" };
      }
    }
    return handleError(error);
  }
}

export async function registerAction(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const validatedFields = registerSchema.safeParse({
      name,
      email,
      password,
    });

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0]?.message || "Invalid input",
      };
    }

    const { name: validName, email: validEmail, password: validPassword } = validatedFields.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validEmail },
    });

    if (existingUser) {
      return { error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validPassword, 10);

    // Create user
    await prisma.user.create({
      data: {
        name: validName,
        email: validEmail,
        password: hashedPassword,
        role: "USER",
      },
    });

    // Auto login after registration
    await signIn("credentials", {
      email: validEmail,
      password: validPassword,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function logoutAction() {
  try {
    await signOut({ redirect: false });
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}
