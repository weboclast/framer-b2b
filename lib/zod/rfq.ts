import { z } from "zod";

const addressSchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  postal: z.string().optional(),
  state: z.string().optional(),
  line1: z.string().optional(),
  line2: z.string().optional(),
}).optional();

const rfqItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  imageUrl: z.string().url().optional(),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  additionalData: z.record(z.string(), z.any()).optional(),
});

export const rfqSubmissionSchema = z.object({
  storeId: z.string().min(1, "Store ID is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required"),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  shippingDetails: addressSchema,
  additionalCustomerData: z.record(z.string(), z.any()).optional(),
  products: z.array(rfqItemSchema).min(1, "At least one product is required"),
  consumerUserId: z.string().optional(),
});


export const rfqQuoteSchema = z.object({
  messageBody: z.string().min(1, "Message body is required"),
});

export const rfqStatusUpdateSchema = z.object({
  status: z.enum(["PENDING", "QUOTED", "ACCEPTED", "CLOSED"]),
  note: z.string().optional(),
});

export type RFQSubmission = z.infer<typeof rfqSubmissionSchema>;
export type RFQQuote = z.infer<typeof rfqQuoteSchema>;
export type RFQStatusUpdate = z.infer<typeof rfqStatusUpdateSchema>;
export type RFQItemInput = z.infer<typeof rfqItemSchema>;
