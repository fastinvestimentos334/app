import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import AppShell from "@/components/AppShell";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiGet } from "@/lib/api";
import { brl, dateTimeBR, STATUS_LABELS } from "@/lib/format";
import type { HistoryEntry } from "@/lib/types";

const KIND = {
  aporte: { icon: ArrowUpRight, color: "text-white", label: "Aporte" },
  rendimento: { icon: TrendingUp, color: "text-[#00E676]", label: "Rendimento" },
  resgate: { icon: ArrowDownRight, color: "text-[#FFD740]", label: "Resgate" },
} as const;

export default function Historico() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: () => apiGet<HistoryEntry[]>("/investments/history"),
    retry: false,
  });

  return (
    <AppShell>
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Histórico</h1>
      <p className="mt-2 text-sm text-[#94A3B8]">
        Registro de aportes, rendimentos apurados e solicitações de resgate.
      </p>

      {isError && (
        <p className="mt-4 text-sm text-[#FF8A80]" data-testid="history-error">
          Não foi possível carregar o histórico agora.
        </p>
      )}

      <div className="mt-6 space-y-3" data-testid="history-list">
        {isLoading ? (
          <Card className="border-[#2D3239] bg-[#22252A] p-8 text-center" data-testid="history-loading">
            <p className="text-sm text-[#94A3B8]">Carregando lançamentos...</p>
          </Card>
        ) : (data ?? []).length === 0 ? (
          <Card className="border-[#2D3239] bg-[#22252A] p-8 text-center" data-testid="history-empty">
            <p className="text-sm text-[#94A3B8]">Nenhum lançamento registrado até o momento.</p>
          </Card>
        ) : (
          data?.map((entry) => {
            const meta = KIND[entry.kind];
            return (
              <Card
                key={entry.id}
                className="border-[#2D3239] bg-[#22252A] p-4"
                data-testid={`history-item-${entry.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#141618]">
                      <meta.icon className={`h-5 w-5 ${meta.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{meta.label}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#94A3B8]">{entry.description}</p>
                      <p className="mt-1 text-xs text-[#6B7280]">{dateTimeBR(entry.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono text-sm font-bold ${meta.color}`}>{brl(entry.amount)}</p>
                    <Badge className="mt-1.5 bg-[#2D3239] text-xs text-[#CBD5E1]">
                      {STATUS_LABELS[entry.status] ?? entry.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <WhatsAppButton />
    </AppShell>
  );
}
