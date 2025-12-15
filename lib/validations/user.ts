import { z } from "zod";

export const subscriptionSchema = z.object({
  packageId: z.string().min(1, "Please select a subscription package"),
  paymentMethodId: z.string().min(1, "Please select a payment method"),
});

export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
