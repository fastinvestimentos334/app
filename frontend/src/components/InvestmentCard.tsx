import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { brl, dateBR, pct, STATUS_LABELS } from "@/lib/format";
import type { Investment } from "@/lib/types";

const STATUS_STYLE: Record<string, string> = {
  ativo: "bg-[#00E676] text-[#0A1F14]",
  aguardando_pagamento: "bg-[#FFD740] text-[#1C1E21]",
  concluido: "bg-[#004D40] text-[#A7F3D0]",
  cancelado: "bg-[#FF5252]/20 text-[#FF8A80]",
};

export default function InvestmentCard({ investment }: { investment: Investment }) {
  const progress = investment.business_days
    ? Math.round((investment.elapsed_business_days / investment.business_days) * 100)
    : 0;

  return (
    <Card
      className="border-[#2D3239] bg-[#22252A] p-5"
      data-testid={`investment-card-${investment.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-heading text-lg font-bold text-white">{investment.group_code}</p>
          <p className="mt-1 text-xs text-[#94A3B8]">
            {investment.modality_name} • {investment.business_days} dias úteis • {pct(investment.yield_percent)}{" "}
            no período
          </p>
        </div>
        <Badge
          className={STATUS_STYLE[investment.status] ?? "bg-[#2D3239] text-white"}
          data-testid={`investment-status-${investment.id}`}
        >
          {STATUS_LABELS[investment.status] ?? investment.status}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className="text-xs text-[#94A3B8]">Valor inicial</p>
          <p className="mt-0.5 font-mono text-sm font-bold text-white">{brl(investment.amount)}</p>
        </div>
        <div>
          <p className="text-xs text-[#94A3B8]">Apurado</p>
          <p className="mt-0.5 font-mono text-sm font-bold text-[#00E676]">{brl(investment.accrued_yield)}</p>
        </div>
        <div>
          <p className="text-xs text-[#94A3B8]">Projetado</p>
          <p className="mt-0.5 font-mono text-sm font-bold text-white">{brl(investment.projected_yield)}</p>
        </div>
        <div>
          <p className="text-xs text-[#94A3B8]">Vencimento</p>
          <p className="mt-0.5 font-mono text-sm font-bold text-white">{dateBR(investment.end_date)}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-[#94A3B8]">
          <span>
            Evolução: {investment.elapsed_business_days}/{investment.business_days} dias úteis
          </span>
          <span className="font-mono">{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#141618]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#004D40] to-[#00E676] transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Link
        to={`/investimento/${investment.id}`}
        data-testid={`investment-details-link-${investment.id}`}
        className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#004D40] text-sm font-semibold text-[#A7F3D0] transition-colors duration-200 hover:bg-[#004D40]"
      >
        Ver detalhes <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}
