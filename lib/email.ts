import { Resend } from "resend";
import type { EmailSettings, RFQ, RFQItem } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailTemplateVariables = {
  customerName?: string;
  customerEmail?: string;
  companyName?: string;
  phone?: string;
  rfqId?: string;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  total?: number;
  items?: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  customMessage?: string;
  storeName?: string;
};

function replaceTemplateVariables(
  template: string | null | undefined,
  variables: EmailTemplateVariables
): string {
  if (!template) return "";

  let result = template;

  const replacements: Record<string, string> = {
    "{{customerName}}": variables.customerName || "",
    "{{customerEmail}}": variables.customerEmail || "",
    "{{companyName}}": variables.companyName || "",
    "{{phone}}": variables.phone || "",
    "{{rfqId}}": variables.rfqId || "",
    "{{subtotal}}": variables.subtotal?.toFixed(2) || "0.00",
    "{{tax}}": variables.tax?.toFixed(2) || "0.00",
    "{{shipping}}": variables.shipping?.toFixed(2) || "0.00",
    "{{total}}": variables.total?.toFixed(2) || "0.00",
    "{{storeName}}": variables.storeName || "",
    "{{customMessage}}": variables.customMessage || "",
  };

  if (variables.items && variables.items.length > 0) {
    const itemsHtml = variables.items
      .map(
        (item) =>
          `<tr>
            <td>${item.productName}</td>
            <td>${item.quantity}</td>
            <td>$${item.unitPrice.toFixed(2)}</td>
            <td>$${item.lineTotal.toFixed(2)}</td>
          </tr>`
      )
      .join("");
    result = result.replace("{{items}}", itemsHtml);
  }

  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key, "g"), value);
  }

  return result;
}

export async function sendConfirmationEmail(
  rfq: RFQ & { items: RFQItem[] },
  emailSettings: EmailSettings | null,
  storeName: string
): Promise<{ success: boolean; error?: string }> {
  const sender = emailSettings?.senderAddress || process.env.DEFAULT_FROM_EMAIL;

  if (!sender) {
    return { success: false, error: "No sender email configured" };
  }

  const subject = replaceTemplateVariables(
    emailSettings?.confirmationSubject,
    {
      customerName: rfq.customerName,
      rfqId: rfq.id,
      storeName,
    }
  ) || `RFQ Received - ${rfq.id}`;

  const body = replaceTemplateVariables(emailSettings?.confirmationBody, {
    customerName: rfq.customerName,
    customerEmail: rfq.customerEmail,
    companyName: rfq.companyName || undefined,
    rfqId: rfq.id,
    subtotal: rfq.subtotal,
    tax: rfq.tax,
    shipping: rfq.shipping,
    total: rfq.total,
    items: rfq.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
    storeName,
  }) || `Thank you for your quote request. Your RFQ ID is ${rfq.id}.`;

  try {
    await resend.emails.send({
      from: sender,
      to: rfq.customerEmail,
      subject,
      html: body,
    });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

export async function sendNotificationEmail(
  rfq: RFQ & { items: RFQItem[] },
  emailSettings: EmailSettings | null,
  storeName: string
): Promise<{ success: boolean; error?: string }> {
  const sender = emailSettings?.senderAddress || process.env.DEFAULT_FROM_EMAIL;
  const internalRecipient = emailSettings?.internalRecipient || process.env.INTERNAL_NOTIFICATION_EMAIL;

  if (!sender || !internalRecipient) {
    return { success: false, error: "No sender or recipient email configured" };
  }

  const subject = replaceTemplateVariables(
    emailSettings?.notificationSubject,
    {
      customerName: rfq.customerName,
      customerEmail: rfq.customerEmail,
      companyName: rfq.companyName || undefined,
      rfqId: rfq.id,
      total: rfq.total,
      storeName,
    }
  ) || `New RFQ Received - ${rfq.id}`;

  const body = replaceTemplateVariables(emailSettings?.notificationBody, {
    customerName: rfq.customerName,
    customerEmail: rfq.customerEmail,
    companyName: rfq.companyName || undefined,
    phone: rfq.phone || undefined,
    rfqId: rfq.id,
    total: rfq.total,
    items: rfq.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
    storeName,
  }) || `New quote request from ${rfq.customerName} (${rfq.customerEmail}). Total: $${rfq.total.toFixed(2)}`;

  try {
    await resend.emails.send({
      from: sender,
      to: internalRecipient,
      subject,
      html: body,
    });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

export async function sendQuoteEmail(
  rfq: RFQ & { items: RFQItem[] },
  emailSettings: EmailSettings | null,
  storeName: string,
  customMessage: string
): Promise<{ success: boolean; error?: string }> {
  const sender = emailSettings?.senderAddress || process.env.DEFAULT_FROM_EMAIL;
  const replyTo = emailSettings?.replyTo;

  if (!sender) {
    return { success: false, error: "No sender email configured" };
  }

  const subject = replaceTemplateVariables(
    emailSettings?.quoteSubject,
    {
      customerName: rfq.customerName,
      rfqId: rfq.id,
      storeName,
    }
  ) || `Quote for RFQ - ${rfq.id}`;

  const body = replaceTemplateVariables(emailSettings?.quoteBody, {
    customerName: rfq.customerName,
    customerEmail: rfq.customerEmail,
    companyName: rfq.companyName || undefined,
    rfqId: rfq.id,
    subtotal: rfq.subtotal,
    tax: rfq.tax,
    shipping: rfq.shipping,
    total: rfq.total,
    items: rfq.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
    customMessage,
    storeName,
  });

  try {
    await resend.emails.send({
      from: sender,
      to: rfq.customerEmail,
      subject,
      html: body,
      replyTo: replyTo || undefined,
    });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/new-password?token=${token}`;
  const sender = process.env.DEFAULT_FROM_EMAIL || "onboarding@resend.dev";

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: sender,
      to: email,
      subject: "Reset your password",
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}
