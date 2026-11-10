import { z } from "zod";

export const orderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export const personalisationStatusSchema = z.object({
  status: z.enum(["REQUESTED", "APPROVED", "IN_PROGRESS", "COMPLETED", "REJECTED"]),
});

export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
export type PersonalisationStatusInput = z.infer<typeof personalisationStatusSchema>;
