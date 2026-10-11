import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowLeft, Clock } from "lucide-react";
import AppShell from "@/components/AppShell";
import WhatsAppButton from "@/components/WhatsAppButton";
import { apiGet } from "@/lib/api";
import { brl, dateBR, pct, STATUS_LABELS } from "@/lib/format";
import type { InvestmentDetail } from "@/lib/types";

const STATUS_STYLE: Record<string, string> = {
  ativo: "border-[#00E676]/30 bg-[#00E676]/10 text-[#00E676]",
  aguardando_pagamento: "border-[#FFD740]/30 bg-[#FFD740]/10 text-[#FFD740]",
  concluido: "border-[#00E676]/20 bg-[#00E676]/[0.06] text-[#A7F3D0]",
  cancelado: "border-[#FF5252]/30 bg-[#FF5252]/10 text-[#FF8A80]",
};

export default function InvestimentoDetalhe() {
  const { id = "" } = useParams();
  const { data, isError } = useQuery({
    queryKey: ["investment", id],
    queryFn: () => apiGet<InvestmentDetail>(`/investments/${id}`),
    retry: false,
  });

  const inv = data?.investment;
  const series = data?.series ?? [];

  // A curva mostra o apurado até hoje; o restante do período fica como projeção tracejada.
  const chartData = series.map((p) => ({
    label: p.day === 0 ? "Início" : `D${p.day}`,
    day: p.day,
    date: p.date,
    apurado: p.realized ? p.accrued_total : null,
    projetado: p.accrued_total,
  }));
  const lastRealized = series.filter((p) => p.realized).at(-1);

  return (
    <AppShell>
      <Link
        to="/painel"
        data-testid="detail-back-link"
        className="inline-flex items-center gap-2 text-sm text-[#8A94A0] transition-colors duration-200 hover:text-[#00E676]"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao painel
      </Link>

      <header className="mt-5">
        <div className="flex flex-wrap items-center gap-3">
          <h1
            className="text-[1.75rem] font-semibold text-white sm:text-[2.25rem]"
            data-testid="detail-title"
          >
            {inv?.group_code ?? "Investimento"}
          </h1>
          {inv && (
            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide ${
                STATUS_STYLE[inv.status] ?? "border-white/10 bg-white/5 text-white"
              }`}
              data-testid="detail-status-badge"
            >
              {STATUS_LABELS[inv.status] ?? inv.status}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-[#7D8794]" data-testid="detail-modality-line">
          {inv ? `${inv.modality_name} · ${pct(inv.yield_percent)} no período` : "Carregando..."}
        </p>
      </header>

      {isError && (
        <p
          className="mt-6 rounded-xl border border-[#FF5252]/25 bg-[#FF5252]/[0.08] px-4 py-3 text-sm text-[#FF8A80]"
          data-testid="detail-error"
        >
          Não foi possível carregar este investimento.
        </p>
      )}

      {inv?.status === "aguardando_pagamento" && (
        <div
          className="mt-6 flex flex-col gap-3 rounded-xl border border-[#FFD740]/25 bg-[#FFD740]/[0.07] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
          data-testid="detail-pending-payment-note"
        >
          <p className="text-sm leading-relaxed text-[#FFE082]">
            Pagamento ainda não confirmado — a curva abaixo mostra apenas a projeção. A apuração diária começa
            no primeiro dia útil após a confirmação pela administração.
          </p>
          <Link
            to={`/checkout/${inv.id}`}
            data-testid="detail-go-to-checkout"
            className="flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-[#FFD740] px-4 text-sm font-semibold text-[#1C1E21] transition-colors duration-200 hover:bg-[#ffdf5c]"
          >
            Ir para o checkout
          </Link>
        </div>
      )}

      {/* KPIs */}
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Valor inicial", value: brl(inv?.amount ?? 0), testid: "detail-amount", mint: false },
          { label: "Apurado", value: brl(inv?.accrued_yield ?? 0), testid: "detail-accrued", mint: true },
          { label: "Projetado", value: brl(inv?.projected_yield ?? 0), testid: "detail-projected", mint: false },
          {
            label: "Total apurado",
            value: brl(inv?.accrued_total ?? 0),
            testid: "detail-accrued-total",
            mint: true,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] p-4"
            data-testid={item.testid}
          >
            <p className="text-[11px] tracking-[0.08em] text-[#7D8794] uppercase">{item.label}</p>
            <p
              className={`mt-1.5 font-mono text-[15px] font-semibold sm:text-base ${
                item.mint ? "text-[#00E676]" : "text-white"
              }`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* CHART */}
      <section
        className="mt-4 overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1A1D21] shadow-[0_18px_50px_-28px_rgba(0,0,0,1)]"
        data-testid="detail-chart-card"
      >
        <div className="flex flex-wrap items-end justify-between gap-4 p-5 pb-0 sm:p-6 sm:pb-0">
          <div>
            <p className="text-[11px] tracking-[0.12em] text-[#7D8794] uppercase">Evolução do investimento</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-[#00E676] sm:text-[1.75rem]">
              {brl(lastRealized?.accrued_total ?? inv?.amount ?? 0)}
            </p>
            <p className="mt-1 text-xs text-[#7D8794]">
              {inv?.elapsed_business_days ?? 0} de {inv?.business_days ?? 0} dias úteis apurados
            </p>
          </div>
          <div className="text-right text-xs text-[#7D8794]">
            <p>Início {dateBR(inv?.start_date)}</p>
            <p className="mt-1">Vencimento {dateBR(inv?.end_date)}</p>
          </div>
        </div>

        <div className="mt-5 h-56 w-full px-1 sm:h-72 sm:px-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 18, left: 6, bottom: 6 }}>
              <defs>
                <linearGradient id="accruedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E676" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#00E676" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.055)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#6B7480"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                stroke="#6B7480"
                fontSize={11}
                width={64}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `R$ ${Math.round(v)}`}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(16,18,21,0.96)",
                  border: "1px solid rgba(0,230,118,0.25)",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 12,
                  boxShadow: "0 18px 40px -20px rgba(0,0,0,1)",
                }}
                labelStyle={{ color: "#8A94A0", marginBottom: 4 }}
                formatter={(value: number, name: string) => [
                  brl(value),
                  name === "apurado" ? "Apurado" : "Projetado",
                ]}
                labelFormatter={(label: string) => `Dia útil ${String(label).replace("D", "")}`}
              />
              {inv?.amount ? (
                <ReferenceLine
                  y={inv.amount}
                  stroke="rgba(255,255,255,0.18)"
                  strokeDasharray="4 4"
                  label={{
                    value: "aporte",
                    position: "insideTopLeft",
                    fill: "#6B7480",
                    fontSize: 10,
                  }}
                />
              ) : null}
              <Area
                type="monotone"
                dataKey="projetado"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                fill="none"
                dot={false}
                activeDot={false}
              />
              <Area
                type="monotone"
                dataKey="apurado"
                stroke="#00E676"
                strokeWidth={2.6}
                fill="url(#accruedFill)"
                dot={false}
                activeDot={{ r: 4, fill: "#00E676", stroke: "#0B1F15", strokeWidth: 2 }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/[0.07] px-5 py-4 sm:px-6">
          <span className="flex items-center gap-2 text-xs text-[#C0C8D1]">
            <span className="h-[3px] w-5 rounded-full bg-[#00E676]" /> Apurado
          </span>
          <span className="flex items-center gap-2 text-xs text-[#8A94A0]">
            <span className="h-px w-5 border-t border-dashed border-white/40" /> Projetado
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-[11px] text-[#6B7480]">
            <Clock className="h-3.5 w-3.5" /> atualizado diariamente às 00h (America/Sao_Paulo)
          </span>
        </div>
      </section>

      {/* SCHEDULE */}
      <section
        className="mt-4 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] p-5 sm:p-6"
        data-testid="detail-schedule-card"
      >
        <div className="flex items-end justify-between gap-4 border-b border-white/[0.07] pb-4">
          <p className="text-sm font-semibold text-white">Cronograma de apuração</p>
          <p className="text-[11px] tracking-[0.08em] text-[#7D8794] uppercase">dia útil a dia útil</p>
        </div>

        {/* desktop */}
        <div className="mt-2 hidden sm:block">
          <table className="w-full">
            <thead>
              <tr>
                {["Dia útil", "Data", "Rendimento acumulado", "Total", "Situação"].map((h) => (
                  <th
                    key={h}
                    className="py-3 text-left text-[11px] font-medium tracking-[0.08em] text-[#7D8794] uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {series.slice(1).map((p) => (
                <tr key={p.day} className="border-t border-white/[0.05]">
                  <td className="py-3 font-mono text-sm text-[#C0C8D1]">
                    {String(p.day).padStart(2, "0")}
                  </td>
                  <td className="py-3 text-sm text-[#C0C8D1]">{dateBR(p.date)}</td>
                  <td className="py-3 font-mono text-sm text-[#00E676]">+{brl(p.accrued_yield)}</td>
                  <td className="py-3 font-mono text-sm text-white">{brl(p.accrued_total)}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] tracking-wide ${
                        p.realized
                          ? "border-[#00E676]/30 bg-[#00E676]/10 text-[#00E676]"
                          : "border-white/10 bg-white/[0.04] text-[#8A94A0]"
                      }`}
                    >
                      {p.realized ? "Apurado" : "Projetado"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* mobile: cards */}
        <div className="mt-4 space-y-2 sm:hidden">
          {series.slice(1).map((p) => (
            <div
              key={p.day}
              data-testid={`schedule-row-${p.day}`}
              className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-[#15181B] px-4 py-3"
            >
              <div>
                <p className="text-[11px] text-[#7D8794]">
                  Dia {String(p.day).padStart(2, "0")} · {dateBR(p.date)}
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-white">{brl(p.accrued_total)}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-semibold text-[#00E676]">+{brl(p.accrued_yield)}</p>
                <p className="mt-0.5 text-[11px] text-[#7D8794]">{p.realized ? "Apurado" : "Projetado"}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <WhatsAppButton />
    </AppShell>
  );
}
