"""Pydantic v2 request/response models. Every TS mirror lives in frontend/src/lib/types.ts."""

import re
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

CPF_RE = re.compile(r"^\d{11}$")


def _digits(value: str) -> str:
    return re.sub(r"\D", "", value or "")


def cpf_is_valid(cpf: str) -> bool:
    cpf = _digits(cpf)
    if not CPF_RE.match(cpf) or cpf == cpf[0] * 11:
        return False
    for size in (9, 10):
        total = sum(int(cpf[i]) * (size + 1 - i) for i in range(size))
        check = (total * 10) % 11
        check = 0 if check == 10 else check
        if check != int(cpf[size]):
            return False
    return True


# --- Auth --------------------------------------------------------------------


class RegisterInput(BaseModel):
    full_name: str = Field(min_length=5, max_length=120)
    cpf: str
    email: EmailStr
    phone: str
    cep: str
    address: str = Field(min_length=3, max_length=160)
    number: str = Field(min_length=1, max_length=20)
    complement: str = Field(default="", max_length=80)
    district: str = Field(min_length=2, max_length=80)
    city: str = Field(min_length=2, max_length=80)
    state: str = Field(min_length=2, max_length=2)
    password: str = Field(min_length=8, max_length=72)
    accept_terms: bool

    @field_validator("cpf")
    @classmethod
    def check_cpf(cls, v: str) -> str:
        if not cpf_is_valid(v):
            raise ValueError("CPF inválido")
        return _digits(v)

    @field_validator("phone")
    @classmethod
    def check_phone(cls, v: str) -> str:
        d = _digits(v)
        if len(d) < 10 or len(d) > 11:
            raise ValueError("Telefone inválido")
        return d

    @field_validator("cep")
    @classmethod
    def check_cep(cls, v: str) -> str:
        d = _digits(v)
        if len(d) != 8:
            raise ValueError("CEP inválido")
        return d

    @field_validator("state")
    @classmethod
    def upper_state(cls, v: str) -> str:
        return v.upper()

    @field_validator("accept_terms")
    @classmethod
    def must_accept(cls, v: bool) -> bool:
        if not v:
            raise ValueError("É necessário aceitar os termos e a política de privacidade")
        return v

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("A senha deve conter letras e números")
        return v


class LoginInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class ForgotPasswordInput(BaseModel):
    email: EmailStr


class ForgotPasswordOutput(BaseModel):
    message: str
    reset_token: str | None = None


class ResetPasswordInput(BaseModel):
    token: str
    password: str = Field(min_length=8, max_length=72)

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("A senha deve conter letras e números")
        return v


class UserOut(BaseModel):
    id: str
    full_name: str
    cpf: str
    email: str
    phone: str
    cep: str = ""
    address: str = ""
    number: str = ""
    complement: str = ""
    district: str = ""
    city: str = ""
    state: str = ""
    role: Literal["client", "admin"]
    created_at: datetime


class MessageOut(BaseModel):
    message: str


# --- Catalog -----------------------------------------------------------------


class GroupOut(BaseModel):
    id: str
    code: str
    amount: float


class ModalityOut(BaseModel):
    id: str
    name: str
    business_days: int
    yield_percent: float
    description: str


class SettingsPublicOut(BaseModel):
    whatsapp_number: str
    whatsapp_message: str
    whatsapp_link: str
    support_email: str
    company_name: str


class CatalogOut(BaseModel):
    groups: list[GroupOut]
    modalities: list[ModalityOut]
    settings: SettingsPublicOut
    reference_date: date


# --- Investments -------------------------------------------------------------


InvestmentStatus = Literal["aguardando_pagamento", "ativo", "concluido", "cancelado"]


class InvestmentCreate(BaseModel):
    group_id: str
    modality_id: str


class InvestmentOut(BaseModel):
    id: str
    user_id: str
    user_name: str = ""
    group_id: str
    group_code: str
    amount: float
    modality_id: str
    modality_name: str
    business_days: int
    yield_percent: float
    status: InvestmentStatus
    created_at: datetime
    start_date: date | None = None
    end_date: date | None = None
    elapsed_business_days: int
    daily_yield: float
    accrued_yield: float
    accrued_total: float
    projected_yield: float
    projected_total: float
    paid_out: bool = False
    payment_link: str = ""


class SeriesPoint(BaseModel):
    day: int
    date: date
    accrued_total: float
    accrued_yield: float
    realized: bool


class InvestmentDetailOut(BaseModel):
    investment: InvestmentOut
    series: list[SeriesPoint]


class DashboardOut(BaseModel):
    greeting_name: str
    total_invested: float
    projected_result: float
    accrued_result: float
    available_balance: float
    paid_out_total: float
    active_count: int
    reference_date: date
    investments: list[InvestmentOut]


# --- Withdrawals -------------------------------------------------------------

WithdrawalStatus = Literal["pendente", "aprovado", "rejeitado"]


class WithdrawalCreate(BaseModel):
    amount: float = Field(gt=0)
    pix_key: str = Field(min_length=4, max_length=120)


class WithdrawalOut(BaseModel):
    id: str
    user_id: str
    user_name: str = ""
    amount: float
    pix_key: str
    status: WithdrawalStatus
    justification: str = ""
    created_at: datetime
    decided_at: datetime | None = None
    decided_by: str = ""
    paid: bool = False
    paid_at: datetime | None = None


class WithdrawalDecision(BaseModel):
    justification: str = Field(min_length=3, max_length=400)


# --- History -----------------------------------------------------------------


class HistoryEntry(BaseModel):
    id: str
    date: datetime
    kind: Literal["aporte", "rendimento", "resgate"]
    description: str
    amount: float
    status: str


# --- Admin -------------------------------------------------------------------


class AdminSummaryOut(BaseModel):
    clients: int
    investments: int
    active_investments: int
    pending_payments: int
    pending_withdrawals: int
    custody_total: float
    accrued_total: float
    reference_date: date


class AdminSettingsOut(BaseModel):
    whatsapp_number: str
    whatsapp_message: str
    whatsapp_link: str = ""
    payment_link: str
    group_payment_links: dict[str, str] = {}
    support_email: str
    company_name: str


class AdminSettingsInput(BaseModel):
    whatsapp_number: str = Field(min_length=10, max_length=20)
    whatsapp_message: str = Field(min_length=3, max_length=200)
    whatsapp_link: str = Field(default="", max_length=300)
    payment_link: str = Field(min_length=8, max_length=300)
    group_payment_links: dict[str, str] = {}
    support_email: EmailStr
    company_name: str = Field(min_length=2, max_length=80)

    @field_validator("whatsapp_link")
    @classmethod
    def check_support_link(cls, v: str) -> str:
        v = (v or "").strip()
        if v and not v.startswith(("http://", "https://")):
            raise ValueError("O link de suporte deve começar com http:// ou https://")
        return v

    @field_validator("group_payment_links")
    @classmethod
    def check_group_links(cls, v: dict[str, str]) -> dict[str, str]:
        cleaned: dict[str, str] = {}
        for group_id, link in (v or {}).items():
            link = (link or "").strip()
            if not link:
                continue
            if not link.startswith(("http://", "https://")):
                raise ValueError(f"O link do grupo {group_id} deve começar com http:// ou https://")
            cleaned[group_id] = link
        return cleaned


class AuditLogOut(BaseModel):
    id: str
    actor_email: str
    action: str
    target_type: str
    target_id: str
    details: str
    created_at: datetime


class AdminClientOut(BaseModel):
    user: UserOut
    investments: int
    total_invested: float
    accrued_result: float
    pending_withdrawals: int
