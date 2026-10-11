import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CheckCircle2,
  FileText,
  Loader2,
  LogOut,
  Settings,
  Trash2,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { apiErrorMessage, brl, dateBR, dateTimeBR, maskCpf, STATUS_LABELS } from "@/lib/format";
import { queryClient } from "@/lib/queryClient";
import { endSession } from "@/lib/session";
import { useCatalog } from "@/hooks/useAppData";
import type {
  AdminClient,
  AdminSettings,
  AdminSummary,
  AuditLog,
  Investment,
  MessageOut,
  Withdrawal,
} from "@/lib/types";

export default function Admin() {
  const navigate = useNavigate();
  const { data: catalog } = useCatalog();
  const groupList = catalog?.groups ?? [];
  const [search, setSearch] = useState("");
  const [decision, setDecision] = useState<{ w: Withdrawal; action: "approve" | "reject" } | null>(null);
  const [justification, setJustification] = useState("");

  const summary = useQuery({
    queryKey: ["admin-summary"],
    queryFn: () => apiGet<AdminSummary>("/admin/summary"),
    retry: false,
  });
  const clients = useQuery({
    queryKey: ["admin-clients", search],
    queryFn: () => apiGet<AdminClient[]>(`/admin/clients?q=${encodeURIComponent(search)}`),
    retry: false,
  });
  const investments = useQuery({
    queryKey: ["admin-investments"],
    queryFn: () => apiGet<Investment[]>("/admin/investments"),
    retry: false,
  });
  const withdrawals = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: () => apiGet<Withdrawal[]>("/admin/withdrawals"),
    retry: false,
  });
  const audit = useQuery({
    queryKey: ["admin-audit"],
    queryFn: () => apiGet<AuditLog[]>("/admin/audit"),
    retry: false,
  });
  const settingsQuery = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => apiGet<AdminSettings>("/admin/settings"),
    retry: false,
  });

  const refreshAll = () => {
    ["admin-summary", "admin-clients", "admin-investments", "admin-withdrawals", "admin-audit"].forEach(
      (key) => void queryClient.invalidateQueries({ queryKey: [key] }),
    );
  };

  const confirmPayment = useMutation({
    mutationFn: (id: string) => apiPost<Investment>(`/admin/investments/${id}/confirm-payment`),
    onSuccess: () => {
      refreshAll();
      toast.success("Pagamento confirmado e investimento ativado.");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const decide = useMutation({
    mutationFn: () =>
      apiPost<Withdrawal>(
        `/admin/withdrawals/${decision?.w.id}/${decision?.action === "approve" ? "approve" : "reject"}`,
        { justification },
      ),
    onSuccess: () => {
      refreshAll();
      setDecision(null);
      setJustification("");
      toast.success("Solicitação analisada e registrada na auditoria.");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const markPaid = useMutation({
    mutationFn: (id: string) => apiPost<Withdrawal>(`/admin/withdrawals/${id}/mark-paid`),
    onSuccess: () => {
      refreshAll();
      toast.success("Pagamento registrado.");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const removeClient = useMutation({
    mutationFn: (id: string) => apiDelete<MessageOut>(`/admin/clients/${id}`),
    onSuccess: () => {
      refreshAll();
      toast.success("Cliente excluído (LGPD).");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const [settingsForm, setSettingsForm] = useState<AdminSettings | null>(null);
  const form = settingsForm ?? settingsQuery.data ?? null;

  const saveSettings = useMutation({
    mutationFn: () => apiPut<AdminSettings>("/admin/settings", form),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      void queryClient.invalidateQueries({ queryKey: ["catalog"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-audit"] });
      toast.success("Parâmetros atualizados.");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const kpis = [
    { label: "Clientes", value: summary.data?.clients ?? 0, testid: "admin-kpi-clients" },
    { label: "Investimentos ativos", value: summary.data?.active_investments ?? 0, testid: "admin-kpi-active" },
    { label: "Pagamentos a confirmar", value: summary.data?.pending_payments ?? 0, testid: "admin-kpi-payments" },
    { label: "Saques pendentes", value: summary.data?.pending_withdrawals ?? 0, testid: "admin-kpi-withdrawals" },
  ];

  return (
    <div className="min-h-svh bg-[#1C1E21]">
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#15181B]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <BrandLogo to="/admin" className="h-8 sm:h-10" testid="admin-brand-logo" />
            <Badge className="hidden border border-[#00E676]/25 bg-[#00E676]/10 text-[#A7F3D0] sm:inline-flex">Administração</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              data-testid="admin-client-view-button"
              onClick={() => navigate("/painel")}
              className="text-[#A0AEC0] hover:text-white"
            >
              Área do cliente
            </Button>
            <Button
              variant="ghost"
              size="sm"
              data-testid="admin-logout-button"
              onClick={async () => {
                await endSession();
                navigate("/login");
              }}
              className="text-[#A0AEC0] hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 pb-28 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Painel administrativo</h1>
        <p className="mt-2 text-sm text-[#8A94A0]" data-testid="admin-reference-date">
          Data de referência: {dateBR(summary.data?.reference_date)} (America/Sao_Paulo)
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] p-4" data-testid={kpi.testid}>
              <p className="text-xs text-[#8A94A0]">{kpi.label}</p>
              <p className="mt-1 font-mono text-2xl font-bold text-white">{kpi.value}</p>
            </Card>
          ))}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Card className="border-[#00E676]/18 bg-gradient-to-br from-[#014A3E] to-[#012E27] shadow-[0_18px_50px_-30px_rgba(0,230,118,0.38)] p-4" data-testid="admin-kpi-custody">
            <p className="text-xs text-[#A7F3D0]">Volume custodiado</p>
            <p className="mt-1 font-mono text-xl font-bold text-white">{brl(summary.data?.custody_total ?? 0)}</p>
          </Card>
          <Card className="border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] p-4" data-testid="admin-kpi-accrued">
            <p className="text-xs text-[#8A94A0]">Rendimento apurado total</p>
            <p className="mt-1 font-mono text-xl font-bold text-[#00E676]">
              {brl(summary.data?.accrued_total ?? 0)}
            </p>
          </Card>
        </div>

        <Tabs defaultValue="saques" className="mt-8">
          <TabsList className="flex w-full flex-wrap gap-1 bg-[#15181B]" data-testid="admin-tabs">
            <TabsTrigger value="saques" data-testid="admin-tab-withdrawals" className="min-h-11 flex-1">
              <Wallet className="mr-2 h-4 w-4" /> Saques
            </TabsTrigger>
            <TabsTrigger value="investimentos" data-testid="admin-tab-investments" className="min-h-11 flex-1">
              Investimentos
            </TabsTrigger>
            <TabsTrigger value="clientes" data-testid="admin-tab-clients" className="min-h-11 flex-1">
              <Users className="mr-2 h-4 w-4" /> Clientes
            </TabsTrigger>
            <TabsTrigger value="config" data-testid="admin-tab-settings" className="min-h-11 flex-1">
              <Settings className="mr-2 h-4 w-4" /> Configurações
            </TabsTrigger>
            <TabsTrigger value="auditoria" data-testid="admin-tab-audit" className="min-h-11 flex-1">
              <FileText className="mr-2 h-4 w-4" /> Auditoria
            </TabsTrigger>
          </TabsList>

          {/* SAQUES */}
          <TabsContent value="saques" className="mt-5 space-y-3" data-testid="admin-withdrawals-panel">
            {(withdrawals.data ?? []).length === 0 ? (
              <Card className="border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] p-6 text-center">
                <p className="text-sm text-[#8A94A0]">Nenhuma solicitação de resgate registrada.</p>
              </Card>
            ) : (
              withdrawals.data?.map((w) => (
                <Card
                  key={w.id}
                  className="border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] p-4"
                  data-testid={`admin-withdrawal-${w.id}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{w.user_name}</p>
                      <p className="mt-1 font-mono text-lg font-bold text-[#00E676]">{brl(w.amount)}</p>
                      <p className="mt-1 text-xs text-[#8A94A0]">
                        PIX {w.pix_key} • {dateTimeBR(w.created_at)}
                      </p>
                    </div>
                    <Badge
                      className={
                        w.status === "pendente"
                          ? "bg-[#FFD740] text-[#1C1E21]"
                          : w.status === "aprovado"
                            ? "bg-[#00E676] text-[#0A1F14]"
                            : "bg-[#FF5252]/20 text-[#FF8A80]"
                      }
                    >
                      {STATUS_LABELS[w.status]}
                    </Badge>
                  </div>
                  {w.justification && (
                    <p className="mt-3 rounded-lg border border-white/[0.08] bg-[#15181B] p-3 text-xs text-[#C0C8D1]">
                      {w.justification}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {w.status === "pendente" && (
                      <>
                        <Button
                          size="sm"
                          data-testid={`admin-approve-withdrawal-${w.id}`}
                          onClick={() => {
                            setDecision({ w, action: "approve" });
                            setJustification("");
                          }}
                          className="min-h-10 bg-[#00E676] font-semibold text-[#0A1F14] hover:bg-[#00c765]"
                        >
                          <CheckCircle2 className="mr-1.5 h-4 w-4" /> Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`admin-reject-withdrawal-${w.id}`}
                          onClick={() => {
                            setDecision({ w, action: "reject" });
                            setJustification("");
                          }}
                          className="min-h-10 border-[#FF5252]/50 text-[#FF8A80]"
                        >
                          <XCircle className="mr-1.5 h-4 w-4" /> Rejeitar
                        </Button>
                      </>
                    )}
                    {w.status === "aprovado" && !w.paid && (
                      <Button
                        size="sm"
                        variant="outline"
                        data-testid={`admin-mark-paid-${w.id}`}
                        onClick={() => markPaid.mutate(w.id)}
                        className="min-h-10 border-[#004D40] text-[#A7F3D0]"
                      >
                        Registrar pagamento efetuado
                      </Button>
                    )}
                    {w.paid && <span className="text-xs text-[#00E676]">Pagamento registrado</span>}
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* INVESTIMENTOS */}
          <TabsContent value="investimentos" className="mt-5 space-y-3" data-testid="admin-investments-panel">
            {(investments.data ?? []).length === 0 ? (
              <Card className="border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] p-6 text-center">
                <p className="text-sm text-[#8A94A0]">Nenhum investimento registrado.</p>
              </Card>
            ) : (
              investments.data?.map((inv) => (
                <Card
                  key={inv.id}
                  className="border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] p-4"
                  data-testid={`admin-investment-${inv.id}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        {inv.group_code} — {inv.user_name}
                      </p>
                      <p className="mt-1 text-xs text-[#8A94A0]">
                        {inv.modality_name} • {brl(inv.amount)} • apurado {brl(inv.accrued_yield)} de{" "}
                        {brl(inv.projected_yield)}
                      </p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        Início {dateBR(inv.start_date)} • Vencimento {dateBR(inv.end_date)} •{" "}
                        {inv.elapsed_business_days}/{inv.business_days} dias úteis
                      </p>
                    </div>
                    <Badge className="border border-white/10 bg-white/[0.06] text-[#C0C8D1]">{STATUS_LABELS[inv.status]}</Badge>
                  </div>
                  {inv.status === "aguardando_pagamento" && (
                    <Button
                      size="sm"
                      data-testid={`admin-confirm-payment-${inv.id}`}
                      onClick={() => confirmPayment.mutate(inv.id)}
                      disabled={confirmPayment.isPending}
                      className="mt-4 min-h-10 bg-[#00E676] font-semibold text-[#0A1F14] hover:bg-[#00c765]"
                    >
                      Confirmar pagamento recebido
                    </Button>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          {/* CLIENTES */}
          <TabsContent value="clientes" className="mt-5" data-testid="admin-clients-panel">
            <Input
              data-testid="admin-client-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, e-mail ou CPF"
              className="h-12 rounded-xl border-white/[0.09] bg-[#15181B] text-white transition-colors duration-200 focus:border-[#00E676]/50"
            />
            <div className="mt-4 space-y-3">
              {(clients.data ?? []).length === 0 ? (
                <Card className="border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] p-6 text-center">
                  <p className="text-sm text-[#8A94A0]">Nenhum cliente encontrado.</p>
                </Card>
              ) : (
                clients.data?.map((c) => (
                  <Card
                    key={c.user.id}
                    className="border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] p-4"
                    data-testid={`admin-client-${c.user.id}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{c.user.full_name}</p>
                        <p className="mt-1 text-xs text-[#8A94A0]">
                          {c.user.email} • CPF {maskCpf(c.user.cpf)}
                        </p>
                        <p className="mt-1 text-xs text-[#6B7280]">
                          {c.user.city}/{c.user.state} • cadastro {dateTimeBR(c.user.created_at)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        data-testid={`admin-delete-client-${c.user.id}`}
                        onClick={() => removeClient.mutate(c.user.id)}
                        className="text-[#FF8A80]"
                        aria-label="Excluir cliente (LGPD)"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3 border-t border-white/[0.08] pt-3">
                      <div>
                        <p className="text-xs text-[#8A94A0]">Investimentos</p>
                        <p className="font-mono text-sm font-bold text-white">{c.investments}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8A94A0]">Total investido</p>
                        <p className="font-mono text-sm font-bold text-white">{brl(c.total_invested)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8A94A0]">Apurado</p>
                        <p className="font-mono text-sm font-bold text-[#00E676]">{brl(c.accrued_result)}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* CONFIGURAÇÕES */}
          <TabsContent value="config" className="mt-5" data-testid="admin-settings-panel">
            <Card className="border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] p-5 sm:p-7">
              <p className="text-sm font-semibold text-white">Parâmetros operacionais</p>
              <p className="mt-1 text-xs text-[#8A94A0]">
                O link de pagamento, os links por grupo e o atendimento são aplicados imediatamente em toda a
                plataforma.
              </p>
              <form
                className="mt-5 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (form) saveSettings.mutate();
                }}
              >
                <div>
                  <Label htmlFor="payment_link" className="text-[#C0C8D1]">
                    Link de pagamento padrão (usado quando o grupo não tem link próprio)
                  </Label>
                  <Input
                    id="payment_link"
                    data-testid="admin-payment-link-input"
                    value={form?.payment_link ?? ""}
                    onChange={(e) => form && setSettingsForm({ ...form, payment_link: e.target.value })}
                    className="mt-2 h-12 rounded-xl border-white/[0.09] bg-[#15181B] text-white transition-colors duration-200 focus:border-[#00E676]/50"
                  />
                </div>

                {/* Link de checkout individual por grupo */}
                <div className="rounded-xl border border-white/[0.08] bg-[#15181B] p-4 sm:p-5">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">Link de checkout por grupo</p>
                      <p className="mt-1 text-xs text-[#8A94A0]">
                        Defina um link exclusivo para cada grupo. Em branco, o grupo usa o link padrão acima.
                      </p>
                    </div>
                    <span className="font-mono text-[11px] text-[#00E676]" data-testid="admin-group-links-count">
                      {Object.values(form?.group_payment_links ?? {}).filter((v) => v.trim()).length}/
                      {groupList.length} personalizados
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {groupList.map((group) => (
                      <div
                        key={group.id}
                        className="flex flex-col gap-2 border-t border-white/[0.06] pt-3 sm:flex-row sm:items-center sm:gap-4"
                      >
                        <div className="flex shrink-0 items-center justify-between sm:w-40">
                          <span className="font-heading text-sm font-semibold text-white">{group.code}</span>
                          <span className="font-mono text-xs text-[#8A94A0]">{brl(group.amount)}</span>
                        </div>
                        <Input
                          data-testid={`admin-group-link-input-${group.id.toLowerCase()}`}
                          value={form?.group_payment_links?.[group.id] ?? ""}
                          placeholder={form?.payment_link || "https://..."}
                          onChange={(e) =>
                            form &&
                            setSettingsForm({
                              ...form,
                              group_payment_links: {
                                ...(form.group_payment_links ?? {}),
                                [group.id]: e.target.value,
                              },
                            })
                          }
                          className="h-11 flex-1 rounded-lg border-white/[0.09] bg-[#1C1F23] text-sm text-white transition-colors duration-200 focus:border-[#00E676]/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="whatsapp_link" className="text-[#C0C8D1]">
                    Link do suporte (WhatsApp ou outro canal)
                  </Label>
                  <Input
                    id="whatsapp_link"
                    data-testid="admin-whatsapp-link-input"
                    value={form?.whatsapp_link ?? ""}
                    placeholder="https://wa.me/5511999999999 — em branco, usa o número abaixo"
                    onChange={(e) => form && setSettingsForm({ ...form, whatsapp_link: e.target.value })}
                    className="mt-2 h-12 rounded-xl border-white/[0.09] bg-[#15181B] text-white transition-colors duration-200 focus:border-[#00E676]/50"
                  />
                  <p className="mt-2 text-xs text-[#8A94A0]">
                    Este link é usado pelo botão flutuante de atendimento em todas as páginas.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="whatsapp_number" className="text-[#C0C8D1]">
                      WhatsApp oficial (com DDI)
                    </Label>
                    <Input
                      id="whatsapp_number"
                      data-testid="admin-whatsapp-number-input"
                      value={form?.whatsapp_number ?? ""}
                      onChange={(e) => form && setSettingsForm({ ...form, whatsapp_number: e.target.value })}
                      placeholder="5511999999999"
                      className="mt-2 h-12 border-white/[0.08] bg-[#15181B] font-mono text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="support_email" className="text-[#C0C8D1]">
                      E-mail de atendimento
                    </Label>
                    <Input
                      id="support_email"
                      type="email"
                      data-testid="admin-support-email-input"
                      value={form?.support_email ?? ""}
                      onChange={(e) => form && setSettingsForm({ ...form, support_email: e.target.value })}
                      className="mt-2 h-12 rounded-xl border-white/[0.09] bg-[#15181B] text-white transition-colors duration-200 focus:border-[#00E676]/50"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="whatsapp_message" className="text-[#C0C8D1]">
                    Mensagem inicial do WhatsApp
                  </Label>
                  <Input
                    id="whatsapp_message"
                    data-testid="admin-whatsapp-message-input"
                    value={form?.whatsapp_message ?? ""}
                    onChange={(e) => form && setSettingsForm({ ...form, whatsapp_message: e.target.value })}
                    className="mt-2 h-12 rounded-xl border-white/[0.09] bg-[#15181B] text-white transition-colors duration-200 focus:border-[#00E676]/50"
                  />
                </div>
                <div>
                  <Label htmlFor="company_name" className="text-[#C0C8D1]">
                    Nome da empresa
                  </Label>
                  <Input
                    id="company_name"
                    data-testid="admin-company-name-input"
                    value={form?.company_name ?? ""}
                    onChange={(e) => form && setSettingsForm({ ...form, company_name: e.target.value })}
                    className="mt-2 h-12 rounded-xl border-white/[0.09] bg-[#15181B] text-white transition-colors duration-200 focus:border-[#00E676]/50"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  data-testid="admin-save-settings-button"
                  disabled={saveSettings.isPending}
                  className="h-13 w-full bg-[#00E676] font-semibold text-[#0A1F14] hover:bg-[#00c765] sm:w-auto sm:px-8"
                >
                  {saveSettings.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar parâmetros"}
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* AUDITORIA */}
          <TabsContent value="auditoria" className="mt-5 space-y-2" data-testid="admin-audit-panel">
            {(audit.data ?? []).length === 0 ? (
              <Card className="border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] p-6 text-center">
                <p className="text-sm text-[#8A94A0]">Nenhum registro de auditoria.</p>
              </Card>
            ) : (
              audit.data?.map((log) => (
                <Card
                  key={log.id}
                  className="border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] p-4"
                  data-testid={`admin-audit-${log.id}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-mono text-xs font-semibold text-[#00E676]">{log.action}</p>
                    <p className="text-xs text-[#6B7280]">{dateTimeBR(log.created_at)}</p>
                  </div>
                  <p className="mt-1.5 text-sm text-white">{log.details || "—"}</p>
                  <p className="mt-1 text-xs text-[#8A94A0]">
                    {log.actor_email} • {log.target_type}:{log.target_id.slice(0, 8)}
                  </p>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Decision dialog */}
      <Dialog open={!!decision} onOpenChange={(open) => !open && setDecision(null)}>
        <DialogContent className="border-white/[0.08] bg-[#15181B] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {decision?.action === "approve" ? "Aprovar solicitação" : "Rejeitar solicitação"}
            </DialogTitle>
            <DialogDescription className="text-[#8A94A0]">
              {decision?.w.user_name} — {brl(decision?.w.amount ?? 0)}. A justificativa é obrigatória e fica
              registrada na auditoria. A aprovação não constitui confirmação de pagamento.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            data-testid="admin-justification-input"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Descreva a análise realizada..."
            className="min-h-24 border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] text-white"
          />
          <Button
            size="lg"
            data-testid="admin-confirm-decision-button"
            disabled={justification.trim().length < 3 || decide.isPending}
            onClick={() => decide.mutate()}
            className={`h-12 w-full font-semibold ${
              decision?.action === "approve"
                ? "bg-[#00E676] text-[#0A1F14] hover:bg-[#00c765]"
                : "bg-[#FF5252] text-white hover:bg-[#e04848]"
            }`}
          >
            {decide.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmar decisão"}
          </Button>
        </DialogContent>
      </Dialog>

      <WhatsAppButton />
    </div>
  );
}
