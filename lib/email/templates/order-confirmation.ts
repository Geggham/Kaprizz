export type OrderConfirmationTemplateInput = {
  customerFirstName: string;
  orderNumber: string;
  total: string;
  currency: string;
  subtotal?: string;
  shipping?: string;
  items?: Array<{
    productName: string;
    colorName: string;
    size: number;
    quantity: number;
    totalPrice: string;
  }>;
  deliveryCity?: string;
  deliveryCountry?: string;
  estimatedDelivery?: string;
  status?: string;
  orderUrl?: string;
};

export type RenderedEmail = {
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character,
  );
}

export function renderOrderConfirmationEmail(
  input: OrderConfirmationTemplateInput,
): RenderedEmail {
  const greeting = input.customerFirstName.trim() || "Customer";
  const amount = `${input.currency} ${input.total}`;
  const orderLink = input.orderUrl
    ? `\nView your order: ${input.orderUrl}\n`
    : "";
  const htmlOrderLink = input.orderUrl
    ? `<p><a href="${escapeHtml(input.orderUrl)}">View your order</a></p>`
    : "";
  const itemLines = (input.items ?? [])
    .map(
      (item) =>
        `- ${item.productName}\n  ${item.colorName} · Size ${item.size} · Qty ${item.quantity}\n  ${input.currency} ${item.totalPrice}`,
    )
    .join("\n");
  const htmlItems = (input.items ?? [])
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.productName)}</strong><br>${escapeHtml(item.colorName)} · Size ${item.size} · Qty ${item.quantity}<br>${escapeHtml(input.currency)} ${escapeHtml(item.totalPrice)}</li>`,
    )
    .join("");
  const delivery = [input.deliveryCity, input.deliveryCountry]
    .filter(Boolean)
    .join(", ");
  const summaryText = [
    input.subtotal ? `Subtotal: ${input.currency} ${input.subtotal}` : "",
    input.shipping ? `Shipping: ${input.currency} ${input.shipping}` : "",
    `Total: ${amount}`,
    delivery ? `Delivery: ${delivery}` : "",
    input.estimatedDelivery
      ? `Estimated delivery: ${input.estimatedDelivery}`
      : "",
    input.status ? `Order status: ${input.status}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Order ${input.orderNumber} confirmed`,
    text: `Hi ${greeting},\n\nThank you for your order. Your order number is ${input.orderNumber}.\n\n${itemLines ? `Products:\n${itemLines}\n\n` : ""}${summaryText}\n${orderLink}\nWe'll contact you by email when your order status changes.\n\nKapriz`,
    html: `<p>Hi ${escapeHtml(greeting)},</p><p>Thank you for your order. Your order number is <strong>${escapeHtml(input.orderNumber)}</strong>.</p>${htmlItems ? `<p>Products:</p><ul>${htmlItems}</ul>` : ""}<p>${escapeHtml(summaryText).replace(/\n/g, "<br>")}</p>${htmlOrderLink}<p>We'll contact you by email when your order status changes.</p><p>Kapriz</p>`,
  };
}
