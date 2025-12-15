import { z } from "zod";

export const houseSchema = z.object({
  name: z.string().min(2, "House name must be at least 2 characters"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const resultSchema = z.object({
  houseId: z.string().min(1, "House is required"),
  date: z.string().min(1, "Date is required"),
  firstRound: z.number().min(0).max(99).nullable(),
  secondRound: z.number().min(0).max(99).nullable(),
});

export const bulkResultSchema = z.object({
  houseId: z.string().min(1, "House is required"),
  results: z.array(
    z.object({
      date: z.string(),
      firstRound: z.number().min(0).max(99).nullable(),
      secondRound: z.number().min(0).max(99).nullable(),
    })
  ),
});

export const paymentMethodSchema = z.object({
  name: z.string().min(2, "Payment method name must be at least 2 characters"),
  upiId: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const approvePaymentSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
  remarks: z.string().optional(),
});

export const rejectPaymentSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
  remarks: z.string().min(1, "Rejection reason is required"),
});

export type HouseInput = z.infer<typeof houseSchema>;
export type ResultInput = z.infer<typeof resultSchema>;
export type BulkResultInput = z.infer<typeof bulkResultSchema>;
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;
export type ApprovePaymentInput = z.infer<typeof approvePaymentSchema>;
export type RejectPaymentInput = z.infer<typeof rejectPaymentSchema>;
