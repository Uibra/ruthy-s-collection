import { MessageCircle } from "lucide-react";

import { whatsappGeneral } from "@/lib/whatsapp";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappGeneral()}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full surface-emerald shadow-lift transition-transform hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
