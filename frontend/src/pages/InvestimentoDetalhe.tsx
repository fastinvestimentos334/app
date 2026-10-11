import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AppShell from "@/components/AppShell";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiGet } from "@/lib/api";
import { brl, dateBR, pct, STATUS_LABELS } from "@/lib/format";
import type { InvestmentDetail } from "@/lib/types";

export default function InvestimentoDetalhe() {
  const { id = "" } = useParams();
  const { data, isError } = useQuery({
    queryKey: ["investment", id],
    queryFn: () => apiGet<InvestmentDetail>(`/investments/${id}`),
    retry: false,
  });

  const inv = data?.investment;
  const chartData = (data?.series ?? []).map((p) => ({
    label: `D${p.day}`,
    date: p.date,
    total: p.accrued_total,
    realized: p.realized,
  }));
  const realizedData = chartData.filter((p) => p.realized);

  return (
    <AppShell>
      <Link to="/painel" data-testid="detail-back-link" className="text-sm text-[#00E676] hover:underline">
        ← Voltar ao painel
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl" data-testid="detail-title">
          {inv?.group_code ?? "Investimento"}
        </h1>
        {inv && (
          <Badge className="border border-[#00E676]/25 bg-[#00E676]/10 text-[#A7F3D0]" data-testid="detail-status-badge">
            {STATUS_LABELS[inv.status] ?? inv.status}
          </Badge>
        )}
      </div>
      <p className="mt-2 text-sm text-[#8A94A0]" data-testid="detail-modality-line">
        {inv ? `${inv.modality_name} • ${pct(inv.yield_percent)} no período` : "Carregando..."}
      </p>

      {isError && (
        <Card className="mt-6 border-[#FF5252]/40 bg-[#FF5252]/10 p-5" data-testid="detail-error">
          <p className="text-sm text-[#FF8A80]">Não foi possível carregar este investimento.</p>
        </Card>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
          <Card key={item.label} className="border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] p-4" data-testid={item.testid}>
            <p className="text-xs text-[#8A94A0]">{item.label}</p>
            <p
              className={`mt-1 font-mono text-base font-bold sm:text-lg ${
                item.mint ? "text-[#00E676]" : "text-white"
              }`}
            >
              {item.value}
            </p>
          </Card>
        ))}
      </div>

      <Card className="mt-4 border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] p-4 sm:p-5" data-testid="detail-chart-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-white">Evolução por dia útil</p>
          <p className="text-xs text-[#8A94A0]">
            Início {dateBR(inv?.start_date)} • Vencimento {dateBR(inv?.end_date)}
          </p>
        </div>
        <div className="mt-4 h-52 w-full sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={realizedData.length > 1 ? realizedData : chartData}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="label" stroke="#8A94A0" fontSize={11} tickLine={false} />
              <YAxis stroke="#8A94A0" fontSize={11} width={56} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#141618",
                  border: "1px solid #004D40",
                  borderRadius: 10,
                  color: "#fff",
                  fontSize: 12,
                }}
                formatter={(value: number) => [brl(value), "Total apurado"]}
                labelFormatter={(label: string) => `Dia útil ${String(label).replace("D", "")}`}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#00E676"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: "#00E676" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-[#6B7280]">
          O gráfico exibe a apuração já realizada. A projeção completa do período consta na tabela abaixo.
        </p>
      </Card>

      <Card className="mt-4 border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] p-4 sm:p-5" data-testid="detail-schedule-card">
        <p className="text-sm font-semibold text-white">Cronograma de apuração</p>

        {/* Desktop: table. Mobile: cards. */}
        <div className="mt-4 hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.08]">
                <TableHead className="text-[#8A94A0]">Dia útil</TableHead>
                <TableHead className="text-[#8A94A0]">Data</TableHead>
                <TableHead className="text-[#8A94A0]">Rendimento acumulado</TableHead>
                <TableHead className="text-[#8A94A0]">Total</TableHead>
                <TableHead className="text-[#8A94A0]">Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.series ?? []).slice(1).map((p) => (
                <TableRow key={p.day} className="border-white/[0.08]">
                  <TableCell className="font-mono text-white">{p.day}</TableCell>
                  <TableCell className="text-[#C0C8D1]">{dateBR(p.date)}</TableCell>
                  <TableCell className="font-mono text-[#00E676]">{brl(p.accrued_yield)}</TableCell>
                  <TableCell className="font-mono text-white">{brl(p.accrued_total)}</TableCell>
                  <TableCell className="text-xs text-[#8A94A0]">
                    {p.realized ? "Apurado" : "Projetado"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 space-y-2 sm:hidden">
          {(data?.series ?? []).slice(1).map((p) => (
            <div
              key={p.day}
              data-testid={`schedule-row-${p.day}`}
              className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#15181B] p-3"
            >
              <div>
                <p className="text-xs text-[#8A94A0]">
                  Dia {p.day} • {dateBR(p.date)}
                </p>
                <p className="mt-0.5 font-mono text-sm font-bold text-white">{brl(p.accrued_total)}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-bold text-[#00E676]">+{brl(p.accrued_yield)}</p>
                <p className="text-xs text-[#8A94A0]">{p.realized ? "Apurado" : "Projetado"}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <WhatsAppButton />
    </AppShell>
  );
}
