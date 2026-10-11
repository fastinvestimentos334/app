import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, ExternalLink } from "lucide-react";
import AppShell from "@/components/AppShell";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { brl, pct } from "@/lib/format";
import type { InvestmentDetail } from "@/lib/types";

export default function Checkout() {
  const { id = "" } = useParams();
  const { data, isError, isLoading } = useQuery({
    queryKey: ["investment", id],
    queryFn: () => apiGet<InvestmentDetail>(`/investments/${id}`),
    retry: false,
  });
  const investment = data?.investment;

  return (
    <AppShell>
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Checkout do aporte</h1>
      <p className="mt-2 text-sm text-[#94A3B8]">
        Conclua o pagamento pelo link oficial. A ativação ocorre após a confirmação pela administração.
      </p>

      {isError && (
        <Card className="mt-6 border-[#FF5252]/40 bg-[#FF5252]/10 p-5" data-testid="checkout-error">
          <p className="text-sm text-[#FF8A80]">Não foi possível carregar este aporte.</p>
        </Card>
      )}

      {isLoading && (
        <p className="mt-6 text-sm text-[#94A3B8]" data-testid="checkout-loading">
          Carregando dados do aporte...
        </p>
      )}

      <Card className="mt-6 border-[#2D3239] bg-[#22252A] p-5 sm:p-7" data-testid="checkout-summary">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-heading text-xl font-bold text-white">{investment?.group_code ?? "—"}</p>
            <p className="mt-1 text-xs text-[#94A3B8]" data-testid="checkout-modality-line">
              {investment ? `${investment.modality_name} • ${pct(investment.yield_percent)} no período` : "—"}
            </p>
          </div>
          <p className="font-mono text-2xl font-bold text-[#00E676]">{brl(investment?.amount ?? 0)}</p>
        </div>

        <dl className="mt-5 grid gap-3 border-t border-[#2D3239] pt-5 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-[#94A3B8]">Projeção do período</dt>
            <dd className="mt-0.5 font-mono text-base font-bold text-white">
              {pct(investment?.yield_percent ?? 0)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#94A3B8]">Rendimento projetado</dt>
            <dd className="mt-0.5 font-mono text-base font-bold text-white">
              {brl(investment?.projected_yield ?? 0)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#94A3B8]">Total projetado</dt>
            <dd className="mt-0.5 font-mono text-base font-bold text-[#00E676]">
              {brl(investment?.projected_total ?? 0)}
            </dd>
          </div>
        </dl>

        <a
          href={investment?.payment_link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="checkout-payment-link"
          className={
            buttonVariants({ size: "lg" }) +
            " mt-6 h-14 w-full bg-[#00E676] text-base font-bold text-[#0A1F14] hover:bg-[#00c765] active:scale-[0.99]"
          }
        >
          <CreditCard className="mr-2 h-5 w-5" /> Pagar {brl(investment?.amount ?? 0)}
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>
        <p className="mt-3 text-center text-xs break-all text-[#6B7280]" data-testid="checkout-payment-url">
          {investment?.payment_link || "Link de pagamento configurado pela administração."}
        </p>
      </Card>

      <Card className="mt-4 border-[#004D40] bg-[#004D40]/30 p-5" data-testid="checkout-next-steps">
        <p className="text-sm font-semibold text-white">Próximos passos</p>
        <ul className="mt-3 space-y-2.5 text-sm text-[#A7F3D0]">
          {[
            "Efetue o pagamento no link oficial acima.",
            "A administração confere e confirma o pagamento recebido.",
            "O período começa a contar no primeiro dia útil seguinte à confirmação.",
            "A apuração diária passa a aparecer no seu painel.",
          ].map((text) => (
            <li key={text} className="flex gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00E676]" /> {text}
            </li>
          ))}
        </ul>
      </Card>

      <Link
        to="/painel"
        data-testid="checkout-back-link"
        className="mt-6 block text-center text-sm text-[#00E676] hover:underline"
      >
        Voltar para o painel
      </Link>

      <WhatsAppButton />
    </AppShell>
  );
}
