import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isSubscriptionActive(
  status: string,
  endDate: Date | null
): boolean {
  if (status !== "ACTIVE") return false;
  if (!endDate) return false;
  return new Date(endDate) > new Date();
}

export function getWhatsAppLink(message?: string): string {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const defaultMessage =
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
    "Hello, I have completed payment for Teer predictions subscription.";
  const encodedMessage = encodeURIComponent(message || defaultMessage);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

export function getDaysRemaining(endDate: Date | string | null): number {
  if (!endDate) return 0;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
