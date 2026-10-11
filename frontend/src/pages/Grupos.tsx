import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiPost } from "@/lib/api";
import { apiErrorMessage, brl, pct } from "@/lib/format";
import { queryClient } from "@/lib/queryClient";
import { useCatalog } from "@/hooks/useAppData";
import type { Group, Investment, Modality } from "@/lib/types";

export default function Grupos() {
  const navigate = useNavigate();
  const { data: catalog, isLoading } = useCatalog();
  const [selected, setSelected] = useState<Group | null>(null);
  const [modality, setModality] = useState<Modality | null>(null);

  const create = useMutation({
    mutationFn: () =>
      apiPost<Investment>("/investments", { group_id: selected?.id, modality_id: modality?.id }),
    onSuccess: (investment) => {
      // Seed the detail cache so the checkout renders the real figures immediately.
      queryClient.setQueryData(["investment", investment.id], {
        investment,
        series: [],
      });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["investments"] });
      setSelected(null);
      setModality(null);
      toast.success("Investimento criado. Conclua o pagamento no checkout.");
      navigate(`/checkout/${investment.id}`);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const groups = catalog?.groups ?? [];
  const modalities = catalog?.modalities ?? [];

  return (
    <AppShell>
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Grupos de investimento</h1>
      <p className="mt-2 text-sm text-[#8A94A0]">
        Escolha um grupo, selecione a modalidade de prazo e siga para o checkout.
      </p>

      {isLoading && (
        <p className="mt-6 text-sm text-[#8A94A0]" data-testid="groups-loading">
          Carregando grupos...
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {groups.map((group) => (
          <button
            key={group.id}
            type="button"
            data-testid={`group-card-${group.id.toLowerCase()}`}
            onClick={() => {
              setSelected(group);
              setModality(modalities[0] ?? null);
            }}
            className="rounded-xl border border-white/[0.08] bg-[#22252A] p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-[#00E676]/60 hover:shadow-[0_0_20px_rgba(0,230,118,0.15)] active:scale-[0.98] sm:p-5"
          >
            <p className="font-heading text-base font-bold text-white sm:text-lg">{group.code}</p>
            <p className="mt-2 font-mono text-lg font-bold text-[#00E676] sm:text-xl">{brl(group.amount)}</p>
            <p className="mt-3 flex items-center gap-1 text-xs text-[#8A94A0]">
              Ver detalhes <ArrowRight className="h-3 w-3" />
            </p>
          </button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90svh] overflow-y-auto border-white/[0.08] bg-[#15181B] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-white" data-testid="group-dialog-title">
              {selected?.code} — {brl(selected?.amount ?? 0)}
            </DialogTitle>
            <DialogDescription className="text-[#8A94A0]">
              Selecione a modalidade de prazo para este grupo. A apuração é calculada no servidor, por dia útil.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {modalities.map((m) => {
              const active = modality?.id === m.id;
              const total = (selected?.amount ?? 0) * (1 + m.yield_percent / 100);
              return (
                <button
                  key={m.id}
                  type="button"
                  data-testid={`modality-option-${m.id}`}
                  onClick={() => setModality(m)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors duration-200 ${
                    active
                      ? "border-[#00E676] bg-[#014A3E]"
                      : "border-white/[0.08] bg-[#22252A] hover:border-[#00796B]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{m.name}</p>
                    <Badge className="bg-[#00E676] text-[#0A1F14]">{pct(m.yield_percent)}</Badge>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#C0C8D1]">{m.description}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-3">
                    <div>
                      <p className="text-xs text-[#8A94A0]">Projeção por dia útil</p>
                      <p className="font-mono text-sm font-bold text-white">
                        {brl(((selected?.amount ?? 0) * m.yield_percent) / 100 / m.business_days)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8A94A0]">Total projetado</p>
                      <p className="font-mono text-sm font-bold text-[#00E676]">{brl(total)}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="rounded-lg border border-[#00E676]/15 bg-[#013B31]/55 p-3 text-xs leading-relaxed text-[#A7F3D0]">
            O período começa a contar no primeiro dia útil após a confirmação do pagamento pela administração. A
            apuração diária é proporcional aos dias úteis decorridos.
          </p>

          <Button
            size="lg"
            data-testid="group-continue-checkout-button"
            disabled={!modality || create.isPending}
            onClick={() => create.mutate()}
            className="h-13 w-full bg-[#00E676] text-base font-semibold text-[#0A1F14] hover:bg-[#00c765]"
          >
            {create.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continuar para o checkout"}
          </Button>
        </DialogContent>
      </Dialog>

      <WhatsAppButton />
    </AppShell>
  );
}
