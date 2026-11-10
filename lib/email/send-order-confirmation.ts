import "server-only";

import type { OrderConfirmationTemplateInput } from "./templates/order-confirmation";

export type SendOrderConfirmationInput = OrderConfirmationTemplateInput & {
  to: string;
};

export type EmailDeliveryResult = {
  delivered: boolean;
  provider: "console" | "resend" | "unsupported";
  diagnostic?: string;
  messageId?: string;
};

function consoleResult(
  email: SendOrderConfirmationInput,
): EmailDeliveryResult {
  if (process.env.NODE_ENV === "development") {
    console.info("Order confirmation email was not delivered (console provider).", {
      to: email.to,
      orderNumber: email.orderNumber,
    });
  }

  return { delivered: false, provider: "console" };
}

export async function sendOrderConfirmation(
  input: SendOrderConfirmationInput,
): Promise<EmailDeliveryResult> {
  const provider = process.env.EMAIL_PROVIDER?.trim().toLowerCase();

  if (!provider || provider === "console") {
    return consoleResult(input);
  }

  if (provider !== "resend") {
    return {
      delivered: false,
      provider: "unsupported",
      diagnostic: `Unsupported EMAIL_PROVIDER: ${provider}`,
    };
  }

  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    return {
      delivered: false,
      provider: "resend",
      diagnostic: "Resend email configuration is incomplete.",
    };
  }

  // Resend is deliberately not bundled until the provider is selected and its
  // package is installed. This keeps checkout operational without pretending a
  // configured provider delivered mail.
  return {
    delivered: false,
    provider: "resend",
    diagnostic: "Install and configure the Resend adapter before enabling it.",
  };
}
