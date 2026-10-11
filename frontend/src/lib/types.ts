// Hand-written mirrors of the Pydantic models in backend/models/schemas.py.
// Keep both sides in sync in the same edit — nothing infers across the HTTP boundary.

export interface User {
  id: string;
  full_name: string;
  cpf: string;
  email: string;
  phone: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  role: "client" | "admin";
  created_at: string;
}

export interface MessageOut {
  message: string;
}

export interface Group {
  id: string;
  code: string;
  amount: number;
}

export interface Modality {
  id: string;
  name: string;
  business_days: number;
  yield_percent: number;
  description: string;
}

export interface SettingsPublic {
  whatsapp_number: string;
  whatsapp_message: string;
  support_email: string;
  company_name: string;
}

export interface Catalog {
  groups: Group[];
  modalities: Modality[];
  settings: SettingsPublic;
  reference_date: string;
}

export type InvestmentStatus = "aguardando_pagamento" | "ativo" | "concluido" | "cancelado";

export interface Investment {
  id: string;
  user_id: string;
  user_name: string;
  group_id: string;
  group_code: string;
  amount: number;
  modality_id: string;
  modality_name: string;
  business_days: number;
  yield_percent: number;
  status: InvestmentStatus;
  created_at: string;
  start_date: string | null;
  end_date: string | null;
  elapsed_business_days: number;
  daily_yield: number;
  accrued_yield: number;
  accrued_total: number;
  projected_yield: number;
  projected_total: number;
  paid_out: boolean;
  payment_link: string;
}

export interface SeriesPoint {
  day: number;
  date: string;
  accrued_total: number;
  accrued_yield: number;
  realized: boolean;
}

export interface InvestmentDetail {
  investment: Investment;
  series: SeriesPoint[];
}

export interface Dashboard {
  greeting_name: string;
  total_invested: number;
  projected_result: number;
  accrued_result: number;
  available_balance: number;
  paid_out_total: number;
  active_count: number;
  reference_date: string;
  investments: Investment[];
}

export type WithdrawalStatus = "pendente" | "aprovado" | "rejeitado";

export interface Withdrawal {
  id: string;
  user_id: string;
  user_name: string;
  amount: number;
  pix_key: string;
  status: WithdrawalStatus;
  justification: string;
  created_at: string;
  decided_at: string | null;
  decided_by: string;
  paid: boolean;
  paid_at: string | null;
}

export interface HistoryEntry {
  id: string;
  date: string;
  kind: "aporte" | "rendimento" | "resgate";
  description: string;
  amount: number;
  status: string;
}

export interface AdminSummary {
  clients: number;
  investments: number;
  active_investments: number;
  pending_payments: number;
  pending_withdrawals: number;
  custody_total: number;
  accrued_total: number;
  reference_date: string;
}

export interface AdminSettings {
  whatsapp_number: string;
  whatsapp_message: string;
  payment_link: string;
  support_email: string;
  company_name: string;
}

export interface AuditLog {
  id: string;
  actor_email: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  created_at: string;
}

export interface AdminClient {
  user: User;
  investments: number;
  total_invested: number;
  accrued_result: number;
  pending_withdrawals: number;
}

export interface BalanceOut {
  available_balance: number;
}

export interface ForgotPasswordOut {
  message: string;
  reset_token: string | null;
}
