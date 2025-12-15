import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = "UNKNOWN_ERROR",
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, "AUTHENTICATION_ERROR", 401);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "You don't have permission to perform this action") {
    super(message, "AUTHORIZATION_ERROR", 403);
    this.name = "AuthorizationError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed") {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export function handleError(error: unknown): { error: string } {
  console.error("Error occurred:", error);

  // Zod validation errors
  if (error instanceof ZodError) {
    const firstError = error.errors[0];
    return {
      error: firstError?.message || "Validation failed. Please check your input.",
    };
  }

  // Custom app errors
  if (error instanceof AppError) {
    return { error: error.message };
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        const target = (error.meta?.target as string[]) || [];
        const field = target[0] || "field";
        return { error: `A record with this ${field} already exists.` };
      case "P2003":
        return { error: "Related record not found." };
      case "P2025":
        return { error: "Record not found." };
      default:
        return { error: "A database error occurred. Please try again." };
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return { error: "Invalid data provided. Please check your input." };
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return { error: "Database connection failed. Please try again later." };
  }

  // Generic error
  if (error instanceof Error) {
    // Don't expose internal errors in production
    if (process.env.NODE_ENV === "production") {
      return { error: "An unexpected error occurred. Please try again." };
    }
    return { error: error.message };
  }

  return { error: "An unexpected error occurred. Please try again." };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
