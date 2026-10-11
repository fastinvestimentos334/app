export const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);

export const pct = (value: number) =>
  `${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value ?? 0)}%`;

/** Formats an ISO date (YYYY-MM-DD) or datetime without shifting the server-anchored day. */
export const dateBR = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const [datePart] = iso.split("T");
  const [y, m, d] = datePart.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
};

export const dateTimeBR = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });
};

export const maskCpf = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
};

export const maskPhone = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
};

export const maskCep = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  return d.replace(/^(\d{5})(\d{1,3})$/, "$1-$2");
};

export const onlyDigits = (raw: string) => raw.replace(/\D/g, "");

export const STATUS_LABELS: Record<string, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  ativo: "Ativo",
  concluido: "Concluído",
  cancelado: "Cancelado",
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

export const apiErrorMessage = (error: unknown, fallback = "Não foi possível concluir a operação.") => {
  const body = (error as { body?: unknown })?.body as
    | { detail?: unknown }
    | undefined;
  const detail = body?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const first = detail[0] as { msg?: string } | undefined;
    if (first?.msg) return first.msg.replace(/^Value error, /, "");
  }
  return fallback;
};
