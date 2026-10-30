import { formatNaira, shop } from "./shop-config";
import type { Product } from "./products";

function link(message: string) {
  return `https://wa.me/${shop.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function optionText(options?: Record<string, string>, separator = "\n") {
  if (!options) return "";
  return Object.entries(options)
    .map(([k, v]) => `${k}: ${v}`)
    .join(separator);
}

export function whatsappGeneral(message?: string) {
  return link(message ?? `Hello ${shop.name}, I have a question about your products.`);
}

export function whatsappProduct(
  product: Product,
  quantity = 1,
  options?: Record<string, string>,
) {
  return link(
    [
      `Hello ${shop.name}, I would like to order:`,
      "",
      `Product: ${product.name}`,
      optionText(options),
      `Quantity: ${quantity}`,
      `Price: ${formatNaira(product.price * quantity)}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

export function whatsappCart(
  lines: { name: string; quantity: number; price: number; options?: Record<string, string> }[],
  total: number,
  extra?: string,
) {
  const body = lines.map((l) => {
    const extras = optionText(l.options, ", ");
    return `• ${l.quantity} × ${l.name}${extras ? ` (${extras})` : ""} — ${formatNaira(
      l.price * l.quantity,
    )}`;
  });
  return link(
    [
      `Hello ${shop.name}, I would like to order:`,
      "",
      ...body,
      "",
      `Total: ${formatNaira(total)}`,
      extra ?? "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
}
