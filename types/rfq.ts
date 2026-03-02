export type RFQStatus = "PENDING" | "QUOTED" | "ACCEPTED" | "CLOSED";
export type EmailStatus = "PENDING" | "SENT" | "FAILED";
export type UserRole = "OWNER" | "ADMIN";

export interface RFQ {
  id: string;
  storeId: string;
  status: RFQStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  customerName: string;
  customerEmail: string;
  companyName: string | null;
  phone: string | null;
  addressCity: string | null;
  addressCountry: string | null;
  addressPostal: string | null;
  addressState: string | null;
  addressLines: Record<string, string> | null;
  additionalCustomerData: Record<string, unknown> | null;
  rawPayload: Record<string, unknown> | null;
  confirmationEmailStatus: EmailStatus;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RFQItem {
  id: string;
  rfqId: string;
  productId: string | null;
  productName: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  additionalData: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingRule {
  id: string;
  storeId: string;
  countryCode: string | null;
  isDefault: boolean;
  flatRate: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailSettings {
  id: string;
  storeId: string;
  senderAddress: string | null;
  replyTo: string | null;
  internalRecipient: string | null;
  confirmationSubject: string | null;
  confirmationBody: string | null;
  notificationSubject: string | null;
  notificationBody: string | null;
  quoteSubject: string | null;
  quoteBody: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  name: string;
  businessLocation: string | null;
  currency: string;
  taxPercent: number;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  storeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StatusHistory {
  id: string;
  rfqId: string;
  status: RFQStatus;
  note: string | null;
  changedBy: string | null;
  changedAt: Date;
}

export interface QuoteNote {
  id: string;
  rfqId: string;
  sentAt: Date;
  messageBody: string;
  sentBy: string | null;
  emailStatus: EmailStatus;
}

export interface RFQWithItems extends RFQ {
  items: RFQItem[];
  statusHistory?: StatusHistory[];
  quoteNotes?: QuoteNote[];
}

export interface RFQListItem {
  id: string;
  createdAt: Date;
  customerName: string;
  companyName: string | null;
  total: number;
  status: RFQStatus;
  customerEmail: string;
}

export interface ShippingFormData {
  countryCode: string;
  isDefault: boolean;
  flatRate: number;
}

export interface StoreFormData {
  name: string;
  businessLocation: string;
  currency: string;
  taxPercent: number;
}

export interface EmailSettingsFormData {
  senderAddress: string;
  replyTo: string;
  internalRecipient: string;
  confirmationSubject: string;
  confirmationBody: string;
  notificationSubject: string;
  notificationBody: string;
  quoteSubject: string;
  quoteBody: string;
}
