import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { ValidationError } from "./errors";

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "5242880"); // 5MB default
const ALLOWED_IMAGE_TYPES = (
  process.env.ALLOWED_IMAGE_TYPES || "image/jpeg,image/png,image/webp"
).split(",");
const ALLOWED_CSV_TYPES = (
  process.env.ALLOWED_CSV_TYPES || "text/csv,application/vnd.ms-excel"
).split(",");

export type FileType = "image" | "csv";

export interface UploadResult {
  fileName: string;
  filePath: string;
  fileUrl: string;
}

export async function validateFile(
  file: File,
  type: FileType
): Promise<void> {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(
      `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }

  // Check file type
  const allowedTypes = type === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_CSV_TYPES;
  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError(
      `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
    );
  }
}

export async function uploadFile(
  file: File,
  type: FileType,
  folder: string = "general"
): Promise<UploadResult> {
  try {
    // Validate file
    await validateFile(file, type);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop();
    const fileName = `${timestamp}-${randomString}.${extension}`;

    // Create upload directory
    const uploadDir = join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Return file info
    const fileUrl = `/uploads/${folder}/${fileName}`;
    return {
      fileName,
      filePath,
      fileUrl,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new Error("Failed to upload file. Please try again.");
  }
}

export async function uploadImage(
  file: File,
  folder: string = "images"
): Promise<UploadResult> {
  return uploadFile(file, "image", folder);
}

export async function uploadCSV(file: File): Promise<UploadResult> {
  return uploadFile(file, "csv", "csv");
}
