import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import AppShell from "@/components/AppShell";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiGet, apiPost } from "@/lib/api";
import { apiErrorMessage, brl, dateTimeBR, STATUS_LABELS } from "@/lib/format";
import { queryClient } from "@/lib/queryClient";
import type { BalanceOut, Withdrawal } from "@/lib/types";

const STATUS_STYLE: Record<string, string> = {
  pendente: "bg-[#FFD740] text-[#1C1E21]",
  aprovado: "bg-[#00E676] text-[#0A1F14]",
  rejeitado: "bg-[#FF5252]/20 text-[#FF8A80]",
};

export default function Saques() {
  const [amount, setAmount] = useState("");
  const [pixKey, setPixKey] = useState("");

  const { data: balance } = useQuery({
    queryKey: ["withdrawal-balance"],
    queryFn: () => apiGet<BalanceOut>("/withdrawals/balance"),
    retry: false,
  });
  const { data: list, isError, isLoading } = useQuery({
    queryKey: ["withdrawals"],
    queryFn: () => apiGet<Withdrawal[]>("/withdrawals"),
    retry: false,
  });

  const create = useMutation({
    mutationFn: () =>
      apiPost<Withdrawal>("/withdrawals", {
        amount: Number(amount.replace(",", ".")),
        pix_key: pixKey,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      void queryClient.invalidateQueries({ queryKey: ["withdrawal-balance"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setAmount("");
      setPixKey("");
      toast.success("Solicitação enviada. Aguardando aprovação da administração.");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <AppShell>
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Saques e resgates</h1>
      <p className="mt-2 text-sm text-[#8A94A0]">
        Solicite o resgate dos valores apurados e acompanhe o status de cada pedido.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-[#00E676]/18 bg-gradient-to-br from-[#014A3E] to-[#012E27] shadow-[0_18px_50px_-30px_rgba(0,230,118,0.38)] p-5" data-testid="withdrawal-balance-card">
          <p className="text-xs tracking-wide text-[#A7F3D0] uppercase">Disponível para resgate</p>
          <p className="mt-2 font-mono text-3xl font-bold text-[#00E676]">
            {brl(balance?.available_balance ?? 0)}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-[#A7F3D0]">
            Apenas investimentos com período concluído compõem o valor disponível. Pedidos pendentes ou
            aprovados já estão reservados deste saldo.
          </p>
        </Card>

        <Card className="border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] p-5" data-testid="withdrawal-form-card">
          <p className="text-sm font-semibold text-white">Solicitar resgate</p>
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const value = Number(amount.replace(",", "."));
              if (!value || value <= 0) {
                toast.error("Informe um valor válido.");
                return;
              }
              if (pixKey.trim().length < 4) {
                toast.error("Informe uma chave PIX válida.");
                return;
              }
              create.mutate();
            }}
          >
            <div>
              <Label htmlFor="withdraw-amount" className="text-[#C0C8D1]">
                Valor do resgate (R$)
              </Label>
              <Input
                id="withdraw-amount"
                data-testid="withdrawal-amount-input"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="mt-2 h-12 border-white/[0.08] bg-[#15181B] font-mono text-white"
              />
            </div>
            <div>
              <Label htmlFor="withdraw-pix" className="text-[#C0C8D1]">
                Chave PIX do titular
              </Label>
              <Input
                id="withdraw-pix"
                data-testid="withdrawal-pix-input"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
                className="mt-2 h-12 rounded-xl border-white/[0.09] bg-[#15181B] text-white transition-colors duration-200 focus:border-[#00E676]/50"
              />
              <p className="mt-2 text-xs text-[#8A94A0]">
                A chave PIX deve pertencer ao mesmo CPF cadastrado como titular da conta.
              </p>
            </div>
            <Button
              type="submit"
              size="lg"
              data-testid="withdrawal-submit-button"
              disabled={create.isPending}
              className="h-13 w-full bg-[#00E676] text-base font-semibold text-[#0A1F14] hover:bg-[#00c765]"
            >
              {create.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Solicitar resgate"}
            </Button>
          </form>
        </Card>
      </div>

      <Card className="mt-4 flex gap-3 border-white/[0.08] bg-[#15181B] p-4" data-testid="withdrawal-policy-note">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#00E676]" />
        <p className="text-xs leading-relaxed text-[#C0C8D1]">
          Toda liberação passa por aprovação manual da administração, com registro de auditoria. A aprovação
          administrativa <strong className="text-white">não constitui confirmação de pagamento</strong>: a
          efetivação é registrada em etapa separada, quando o pagamento é realizado.
        </p>
      </Card>

      <h2 className="mt-8 text-lg font-bold text-white sm:text-xl">Histórico de solicitações</h2>
      {isError && (
        <p className="mt-3 text-sm text-[#FF8A80]" data-testid="withdrawals-error">
          Não foi possível carregar o histórico agora.
        </p>
      )}
      <div className="mt-4 space-y-3" data-testid="withdrawals-list">
        {isLoading ? (
          <Card className="border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] p-6 text-center" data-testid="withdrawals-loading">
            <p className="text-sm text-[#8A94A0]">Carregando solicitações...</p>
          </Card>
        ) : (list ?? []).length === 0 ? (
          <Card className="border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] p-6 text-center" data-testid="withdrawals-empty">
            <p className="text-sm text-[#8A94A0]">Nenhuma solicitação de resgate registrada.</p>
          </Card>
        ) : (
          list?.map((w) => (
            <Card
              key={w.id}
              className="border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] p-4"
              data-testid={`withdrawal-item-${w.id}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-lg font-bold text-white">{brl(w.amount)}</p>
                  <p className="mt-1 text-xs text-[#8A94A0]">
                    Solicitado em {dateTimeBR(w.created_at)} • PIX {w.pix_key}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge className={STATUS_STYLE[w.status] ?? "border border-white/10 bg-white/[0.06] text-white"}>
                    {STATUS_LABELS[w.status] ?? w.status}
                  </Badge>
                  {w.paid && <span className="text-xs text-[#00E676]">Pagamento registrado</span>}
                </div>
              </div>
              {w.justification && (
                <p className="mt-3 rounded-lg border border-white/[0.08] bg-[#15181B] p-3 text-xs text-[#C0C8D1]">
                  <span className="text-[#8A94A0]">Parecer da administração:</span> {w.justification}
                </p>
              )}
              {w.decided_at && (
                <p className="mt-2 text-xs text-[#6B7280]">
                  Analisado em {dateTimeBR(w.decided_at)} por {w.decided_by || "administração"}
                </p>
              )}
            </Card>
          ))
        )}
      </div>

      <WhatsAppButton />
    </AppShell>
  );
}
