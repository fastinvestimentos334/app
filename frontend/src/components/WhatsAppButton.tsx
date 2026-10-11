import { MessageCircle } from "lucide-react";
import { useCatalog } from "@/hooks/useAppData";

/** Link de suporte resolvido no servidor: override do admin ou wa.me do número oficial. */
export function useSupportLink() {
  const { data } = useCatalog();
  if (data?.settings.whatsapp_link) return data.settings.whatsapp_link;
  const number = data?.settings.whatsapp_number ?? "5511999999999";
  const message = data?.settings.whatsapp_message ?? "Olá! Preciso de atendimento da FAST INVESTIMENTOS.";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Botão flutuante de atendimento humano, presente em todas as páginas. */
export default function WhatsAppButton() {
  const href = useSupportLink();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-floating-button"
      aria-label="Atendimento humano pelo WhatsApp"
      className="fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_14px_34px_-12px_rgba(37,211,102,0.7)] transition-transform duration-200 hover:scale-105 active:scale-95 sm:right-6 sm:bottom-6 sm:h-auto sm:w-auto sm:gap-2 sm:px-5 sm:py-3.5"
    >
      <MessageCircle className="h-6 w-6 shrink-0" strokeWidth={2.4} />
      <span className="hidden text-sm font-semibold sm:inline">Atendimento humano</span>
    </a>
  );
}
