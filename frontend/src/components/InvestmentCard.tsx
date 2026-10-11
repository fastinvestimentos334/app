import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { brl, dateBR, pct, STATUS_LABELS } from "@/lib/format";
import type { Investment } from "@/lib/types";

const STATUS_STYLE: Record<string, string> = {
  ativo: "border-[#00E676]/30 bg-[#00E676]/10 text-[#00E676]",
  aguardando_pagamento: "border-[#FFD740]/30 bg-[#FFD740]/10 text-[#FFD740]",
  concluido: "border-[#00E676]/20 bg-[#00E676]/[0.06] text-[#A7F3D0]",
  cancelado: "border-[#FF5252]/30 bg-[#FF5252]/10 text-[#FF8A80]",
};

export default function InvestmentCard({ investment }: { investment: Investment }) {
  const progress = investment.business_days
    ? Math.round((investment.elapsed_business_days / investment.business_days) * 100)
    : 0;

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] transition-colors duration-300 hover:border-white/[0.14]"
      data-testid={`investment-card-${investment.id}`}
    >
      {/* hairline accent on the leading edge */}
      <span
        className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#00E676]/50 to-transparent"
        aria-hidden
      />

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-heading text-lg font-semibold text-white sm:text-xl">
              {investment.group_code}
            </p>
            <p className="mt-1.5 text-xs text-[#8A94A0]">
              {investment.modality_name} · {pct(investment.yield_percent)} no período
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide ${
              STATUS_STYLE[investment.status] ?? "border-white/10 bg-white/5 text-white"
            }`}
            data-testid={`investment-status-${investment.id}`}
          >
            {STATUS_LABELS[investment.status] ?? investment.status}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
          {[
            { label: "Valor inicial", value: brl(investment.amount), tone: "text-white" },
            { label: "Apurado", value: brl(investment.accrued_yield), tone: "text-[#00E676]" },
            { label: "Projetado", value: brl(investment.projected_yield), tone: "text-[#D6DCE4]" },
            { label: "Vencimento", value: dateBR(investment.end_date), tone: "text-[#D6DCE4]" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[11px] tracking-[0.08em] text-[#7D8794] uppercase">{item.label}</p>
              <p className={`mt-1 font-mono text-[15px] font-semibold ${item.tone}`}>{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] tracking-[0.08em] text-[#7D8794] uppercase">Evolução</span>
            <span className="font-mono text-xs text-[#9AA5B1]">
              {investment.elapsed_business_days} / {investment.business_days} dias úteis
            </span>
          </div>
          <div className="mt-2.5 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00796B] via-[#00E676] to-[#00E676] transition-[width] duration-700 ease-out"
              style={{ width: `${Math.max(progress, 1.5)}%` }}
            />
          </div>
        </div>
      </div>

      <Link
        to={`/investimento/${investment.id}`}
        data-testid={`investment-details-link-${investment.id}`}
        className="flex min-h-12 items-center justify-between border-t border-white/[0.07] px-5 text-sm font-medium text-[#C7CED6] transition-colors duration-200 hover:bg-white/[0.03] hover:text-[#00E676] sm:px-6"
      >
        Ver detalhes
        <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </article>
  );
}
