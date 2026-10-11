import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, History, MessageCircle, TrendingUp, Wallet } from "lucide-react";
import AppShell from "@/components/AppShell";
import WhatsAppButton from "@/components/WhatsAppButton";
import InvestmentCard from "@/components/InvestmentCard";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { brl, dateBR } from "@/lib/format";
import { useCatalog, useMe } from "@/hooks/useAppData";
import type { Dashboard } from "@/lib/types";

export default function Painel() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiGet<Dashboard>("/investments/dashboard"),
    retry: false,
  });
  const { data: catalog } = useCatalog();
  const { data: me } = useMe();
  const whatsapp = `https://wa.me/${catalog?.settings.whatsapp_number ?? "5511999999999"}`;

  return (
    <AppShell>
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl" data-testid="dashboard-greeting">
        Olá, {data?.greeting_name ?? me?.full_name.split(" ")[0] ?? "investidor"}
      </h1>
      <p className="mt-2 text-sm text-[#94A3B8]" data-testid="dashboard-reference-date">
        Data de referência da apuração: {dateBR(data?.reference_date)} (America/Sao_Paulo)
      </p>

      {isError && (
        <p
          data-testid="dashboard-error-note"
          className="mt-4 rounded-lg border border-[#FF5252]/40 bg-[#FF5252]/10 p-3 text-sm text-[#FF8A80]"
        >
          Não foi possível carregar os dados agora. Os valores aparecerão assim que a conexão for restabelecida.
        </p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="border-[#2D3239] bg-[#22252A] p-5" data-testid="card-total-invested">
          <p className="text-xs tracking-wide text-[#94A3B8] uppercase">Total investido</p>
          <p className="mt-2 font-mono text-2xl font-bold text-white sm:text-3xl">
            {brl(data?.total_invested ?? 0)}
          </p>
          <p className="mt-2 text-xs text-[#94A3B8]">{data?.active_count ?? 0} investimento(s) ativo(s)</p>
        </Card>

        <Card
          className="border-[#004D40] bg-[#004D40]/40 p-5 md:col-span-2"
          data-testid="card-accumulated-result"
        >
          <p className="text-xs tracking-wide text-[#A7F3D0] uppercase">Resultado acumulado</p>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#A7F3D0]">Apurado até hoje</p>
              <p
                className="mt-1 font-mono text-xl font-bold text-[#00E676] sm:text-2xl"
                data-testid="value-accrued-result"
              >
                {brl(data?.accrued_result ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#A7F3D0]">Projetado no período</p>
              <p
                className="mt-1 font-mono text-xl font-bold text-white sm:text-2xl"
                data-testid="value-projected-result"
              >
                {brl(data?.projected_result ?? 0)}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#00796B]/50 pt-3">
            <div>
              <p className="text-xs text-[#A7F3D0]">Disponível para resgate</p>
              <p className="mt-1 font-mono text-base font-bold text-white" data-testid="value-available-balance">
                {brl(data?.available_balance ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#A7F3D0]">Já pago</p>
              <p className="mt-1 font-mono text-base font-bold text-white" data-testid="value-paid-out">
                {brl(data?.paid_out_total ?? 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Link
        to="/grupos"
        data-testid="start-investing-button"
        className={
          buttonVariants({ size: "lg" }) +
          " mt-6 h-15 w-full animate-mint-pulse bg-[#00E676] text-base font-bold tracking-wide text-[#0A1F14] hover:bg-[#00c765] active:scale-[0.99] sm:text-lg"
        }
      >
        COMEÇAR A INVESTIR <ArrowRight className="ml-2 h-5 w-5" />
      </Link>

      <div className="mt-8 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white sm:text-xl">Meus investimentos</h2>
        <span className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
          <TrendingUp className="h-4 w-4 text-[#00E676]" /> apuração por dia útil
        </span>
      </div>

      <div className="mt-4 space-y-4" data-testid="investments-list">
        {isLoading ? (
          <Card className="border-[#2D3239] bg-[#22252A] p-8 text-center" data-testid="investments-loading">
            <p className="text-sm text-[#94A3B8]">Carregando seus investimentos...</p>
          </Card>
        ) : (data?.investments ?? []).length === 0 ? (
          <Card className="border-[#2D3239] bg-[#22252A] p-8 text-center" data-testid="investments-empty-state">
            <p className="text-sm text-[#94A3B8]">
              Você ainda não possui investimentos. Toque em COMEÇAR A INVESTIR para escolher um grupo.
            </p>
          </Card>
        ) : (
          data?.investments.map((investment) => (
            <InvestmentCard key={investment.id} investment={investment} />
          ))
        )}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Link
          to="/historico"
          data-testid="dashboard-history-link"
          className="flex min-h-14 items-center gap-3 rounded-xl border border-[#2D3239] bg-[#22252A] px-4 transition-colors duration-200 hover:border-[#00E676]/50"
        >
          <History className="h-5 w-5 text-[#00E676]" />
          <span className="text-sm font-medium text-white">Histórico</span>
        </Link>
        <Link
          to="/saques"
          data-testid="dashboard-withdrawals-link"
          className="flex min-h-14 items-center gap-3 rounded-xl border border-[#2D3239] bg-[#22252A] px-4 transition-colors duration-200 hover:border-[#00E676]/50"
        >
          <Wallet className="h-5 w-5 text-[#00E676]" />
          <span className="text-sm font-medium text-white">Solicitar resgate</span>
        </Link>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="dashboard-support-button"
          className="flex min-h-14 items-center gap-3 rounded-xl border border-[#2D3239] bg-[#22252A] px-4 transition-colors duration-200 hover:border-[#00E676]/50"
        >
          <MessageCircle className="h-5 w-5 text-[#00E676]" />
          <span className="text-sm font-medium text-white">Suporte</span>
        </a>
      </div>

      <WhatsAppButton />
    </AppShell>
  );
}
