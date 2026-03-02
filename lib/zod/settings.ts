import { z } from "zod";

export const storeSettingsSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  businessLocation: z.string().optional(),
  currency: z.string().default("USD"),
  taxPercent: z.number().min(0).max(100).default(0),
});

export const emailSettingsSchema = z.object({
  senderAddress: z.string().email("Valid email is required").optional().or(z.literal("")),
  replyTo: z.string().email("Valid email is required").optional().or(z.literal("")),
  internalRecipient: z.string().email("Valid email is required").optional().or(z.literal("")),
  confirmationSubject: z.string().optional(),
  confirmationBody: z.string().optional(),
  notificationSubject: z.string().optional(),
  notificationBody: z.string().optional(),
  quoteSubject: z.string().optional(),
  quoteBody: z.string().optional(),
});

export const shippingRuleSchema = z.object({
  countryCode: z.string().optional(),
  isDefault: z.boolean().default(false),
  flatRate: z.number().min(0, "Flat rate must be positive").default(0),
});

export type StoreSettings = z.infer<typeof storeSettingsSchema>;
export type EmailSettings = z.infer<typeof emailSettingsSchema>;
export type ShippingRuleInput = z.infer<typeof shippingRuleSchema>;
