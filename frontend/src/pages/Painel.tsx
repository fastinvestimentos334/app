import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, History, MessageCircle, Wallet } from "lucide-react";
import AppShell from "@/components/AppShell";
import WhatsAppButton from "@/components/WhatsAppButton";
import InvestmentCard from "@/components/InvestmentCard";
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
      <header className="animate-fade-up">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-[#00E676] uppercase">Área do cliente</p>
        <h1
          className="mt-3 text-[1.75rem] font-semibold text-white sm:text-[2.25rem]"
          data-testid="dashboard-greeting"
        >
          Olá, {data?.greeting_name ?? me?.full_name.split(" ")[0] ?? "investidor"}
        </h1>
        <p className="mt-2 text-sm text-[#7D8794]" data-testid="dashboard-reference-date">
          Apuração referente a {dateBR(data?.reference_date)} · America/Sao_Paulo
        </p>
      </header>

      {isError && (
        <p
          data-testid="dashboard-error-note"
          className="mt-5 rounded-xl border border-[#FF5252]/25 bg-[#FF5252]/[0.08] px-4 py-3 text-sm text-[#FF8A80]"
        >
          Não foi possível carregar os dados agora. Os valores aparecerão assim que a conexão for
          restabelecida.
        </p>
      )}

      {/* KPIs */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <section
          className="flex flex-col justify-between rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] p-6 shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)]"
          data-testid="card-total-invested"
        >
          <p className="text-[11px] tracking-[0.12em] text-[#7D8794] uppercase">Total investido</p>
          <p className="mt-3 font-mono text-[2rem] leading-none font-semibold text-white sm:text-[2.25rem]">
            {brl(data?.total_invested ?? 0)}
          </p>
          <p className="mt-6 border-t border-white/[0.07] pt-4 text-xs text-[#7D8794]">
            {data?.active_count ?? 0} investimento(s) ativo(s)
          </p>
        </section>

        <section
          className="relative overflow-hidden rounded-2xl border border-[#00E676]/20 bg-gradient-to-br from-[#014A3E] to-[#012E27] p-6 shadow-[0_18px_50px_-30px_rgba(0,230,118,0.4)] md:col-span-2"
          data-testid="card-accumulated-result"
        >
          <p className="text-[11px] tracking-[0.12em] text-[#A7F3D0] uppercase">Resultado acumulado</p>
          <div className="mt-5 grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-[#8FD9BE]">Apurado até hoje</p>
              <p
                className="mt-1.5 font-mono text-xl font-semibold text-[#00E676] sm:text-2xl"
                data-testid="value-accrued-result"
              >
                {brl(data?.accrued_result ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#8FD9BE]">Projetado no período</p>
              <p
                className="mt-1.5 font-mono text-xl font-semibold text-white sm:text-2xl"
                data-testid="value-projected-result"
              >
                {brl(data?.projected_result ?? 0)}
              </p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6 border-t border-[#00E676]/15 pt-5">
            <div>
              <p className="text-xs text-[#8FD9BE]">Disponível para resgate</p>
              <p
                className="mt-1.5 font-mono text-base font-semibold text-white"
                data-testid="value-available-balance"
              >
                {brl(data?.available_balance ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#8FD9BE]">Já pago</p>
              <p className="mt-1.5 font-mono text-base font-semibold text-white" data-testid="value-paid-out">
                {brl(data?.paid_out_total ?? 0)}
              </p>
            </div>
          </div>
        </section>
      </div>

      <Link
        to="/grupos"
        data-testid="start-investing-button"
        className={
          buttonVariants({ size: "lg" }) +
          " mt-5 h-14 w-full rounded-2xl bg-[#00E676] text-[15px] font-semibold tracking-wide text-[#062315] shadow-[0_16px_40px_-16px_rgba(0,230,118,0.55)] transition-all duration-200 hover:bg-[#13f083] hover:shadow-[0_20px_46px_-16px_rgba(0,230,118,0.65)] active:scale-[0.99] sm:text-base"
        }
      >
        COMEÇAR A INVESTIR <ArrowRight className="ml-2 h-5 w-5" />
      </Link>

      {/* Investments */}
      <div className="mt-12 flex items-end justify-between gap-4 border-b border-white/[0.07] pb-4">
        <h2 className="text-lg font-semibold text-white sm:text-xl">Meus investimentos</h2>
        <span className="text-[11px] tracking-[0.1em] text-[#7D8794] uppercase">apuração por dia útil</span>
      </div>

      <div className="mt-6 space-y-4" data-testid="investments-list">
        {isLoading ? (
          <div
            className="rounded-2xl border border-white/[0.07] bg-[#1F2226] px-6 py-12 text-center"
            data-testid="investments-loading"
          >
            <p className="text-sm text-[#7D8794]">Carregando seus investimentos...</p>
          </div>
        ) : (data?.investments ?? []).length === 0 ? (
          <div
            className="rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.015] px-6 py-14 text-center"
            data-testid="investments-empty-state"
          >
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-[#8A94A0]">
              Você ainda não possui investimentos. Toque em COMEÇAR A INVESTIR para escolher um grupo.
            </p>
          </div>
        ) : (
          data?.investments.map((investment) => (
            <InvestmentCard key={investment.id} investment={investment} />
          ))
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          { to: "/historico", icon: History, label: "Histórico", testid: "dashboard-history-link" },
          { to: "/saques", icon: Wallet, label: "Solicitar resgate", testid: "dashboard-withdrawals-link" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            data-testid={item.testid}
            className="flex min-h-14 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 transition-colors duration-200 hover:border-[#00E676]/40 hover:bg-white/[0.05]"
          >
            <item.icon className="h-[18px] w-[18px] text-[#00E676]" strokeWidth={1.7} />
            <span className="text-sm font-medium text-white">{item.label}</span>
          </Link>
        ))}
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="dashboard-support-button"
          className="flex min-h-14 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 transition-colors duration-200 hover:border-[#00E676]/40 hover:bg-white/[0.05]"
        >
          <MessageCircle className="h-[18px] w-[18px] text-[#00E676]" strokeWidth={1.7} />
          <span className="text-sm font-medium text-white">Suporte</span>
        </a>
      </div>

      <WhatsAppButton />
    </AppShell>
  );
}
