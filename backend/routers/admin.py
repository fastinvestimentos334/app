"""Admin backoffice — all routes gated by a server-side role check (current_admin)."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from lib.business import as_utc, money, now_utc, today_br
from lib.db import db
from lib.security import current_admin, get_settings, public_user, write_audit
from models.schemas import (
    AdminClientOut,
    AdminSettingsInput,
    AdminSettingsOut,
    AdminSummaryOut,
    AuditLogOut,
    InvestmentOut,
    MessageOut,
    WithdrawalDecision,
    WithdrawalOut,
)
from routers.investments import activate_investment, project
from routers.withdrawals import project_withdrawal

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/summary", response_model=AdminSummaryOut)
async def summary(admin: Annotated[dict, Depends(current_admin)]):
    reference = today_br()
    docs = await db.investments.find().to_list(2000)
    items = [project(d, reference) for d in docs]
    return {
        "clients": await db.users.count_documents({"role": "client"}),
        "investments": len(items),
        "active_investments": len([i for i in items if i["status"] == "ativo"]),
        "pending_payments": len([i for i in items if i["status"] == "aguardando_pagamento"]),
        "pending_withdrawals": await db.withdrawals.count_documents({"status": "pendente"}),
        "custody_total": money(sum(i["amount"] for i in items if i["status"] in ("ativo", "concluido"))),
        "accrued_total": money(sum(i["accrued_yield"] for i in items if i["status"] in ("ativo", "concluido"))),
        "reference_date": reference,
    }


@router.get("/clients", response_model=list[AdminClientOut])
async def clients(admin: Annotated[dict, Depends(current_admin)], q: str = ""):
    query: dict = {"role": "client"}
    if q.strip():
        needle = q.strip()
        query["$or"] = [
            {"full_name": {"$regex": needle, "$options": "i"}},
            {"email": {"$regex": needle, "$options": "i"}},
            {"cpf": {"$regex": "".join(ch for ch in needle if ch.isdigit()) or needle}},
        ]
    users = await db.users.find(query).sort("created_at", -1).to_list(500)
    reference = today_br()
    out = []
    for user in users:
        docs = await db.investments.find({"user_id": user["id"]}).to_list(500)
        items = [project(d, reference) for d in docs]
        out.append(
            {
                "user": public_user(user),
                "investments": len(items),
                "total_invested": money(sum(i["amount"] for i in items if i["status"] in ("ativo", "concluido"))),
                "accrued_result": money(sum(i["accrued_yield"] for i in items)),
                "pending_withdrawals": await db.withdrawals.count_documents(
                    {"user_id": user["id"], "status": "pendente"}
                ),
            }
        )
    return out


@router.get("/investments", response_model=list[InvestmentOut])
async def all_investments(admin: Annotated[dict, Depends(current_admin)], status: str = ""):
    query = {"status": status} if status else {}
    docs = await db.investments.find(query).sort("created_at", -1).to_list(2000)
    reference = today_br()
    return [project(d, reference) for d in docs]


@router.post("/investments/{investment_id}/confirm-payment", response_model=InvestmentOut)
async def confirm_payment(investment_id: str, admin: Annotated[dict, Depends(current_admin)]):
    doc = await db.investments.find_one({"id": investment_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Investimento não encontrado.")
    if doc["status"] != "aguardando_pagamento":
        raise HTTPException(status_code=400, detail="Este investimento não está aguardando pagamento.")
    updated = await activate_investment(doc, admin)
    return project(updated, today_br())


@router.post("/investments/{investment_id}/cancel", response_model=InvestmentOut)
async def cancel_investment(
    investment_id: str, payload: WithdrawalDecision, admin: Annotated[dict, Depends(current_admin)]
):
    doc = await db.investments.find_one({"id": investment_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Investimento não encontrado.")
    if doc["status"] in ("concluido", "cancelado"):
        raise HTTPException(status_code=400, detail="Este investimento não pode ser cancelado.")
    await db.investments.update_one(
        {"id": investment_id},
        {"$set": {"status": "cancelado", "cancel_reason": payload.justification, "cancelled_at": now_utc()}},
    )
    await write_audit(admin, "investimento.cancelado", "investment", investment_id, payload.justification)
    return project(await db.investments.find_one({"id": investment_id}), today_br())


@router.get("/withdrawals", response_model=list[WithdrawalOut])
async def all_withdrawals(admin: Annotated[dict, Depends(current_admin)], status: str = ""):
    query = {"status": status} if status else {}
    docs = await db.withdrawals.find(query).sort("created_at", -1).to_list(1000)
    return [project_withdrawal(d) for d in docs]


async def _decide(withdrawal_id: str, admin: dict, decision: str, justification: str) -> dict:
    doc = await db.withdrawals.find_one({"id": withdrawal_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada.")
    if doc["status"] != "pendente":
        raise HTTPException(status_code=400, detail="Solicitação já analisada.")
    await db.withdrawals.update_one(
        {"id": withdrawal_id},
        {
            "$set": {
                "status": decision,
                "justification": justification,
                "decided_at": now_utc(),
                "decided_by": admin["email"],
            }
        },
    )
    await write_audit(
        admin,
        f"resgate.{decision}",
        "withdrawal",
        withdrawal_id,
        f"{justification} | Aprovação administrativa não constitui confirmação de pagamento.",
    )
    return project_withdrawal(await db.withdrawals.find_one({"id": withdrawal_id}))


@router.post("/withdrawals/{withdrawal_id}/approve", response_model=WithdrawalOut)
async def approve_withdrawal(
    withdrawal_id: str, payload: WithdrawalDecision, admin: Annotated[dict, Depends(current_admin)]
):
    return await _decide(withdrawal_id, admin, "aprovado", payload.justification)


@router.post("/withdrawals/{withdrawal_id}/reject", response_model=WithdrawalOut)
async def reject_withdrawal(
    withdrawal_id: str, payload: WithdrawalDecision, admin: Annotated[dict, Depends(current_admin)]
):
    return await _decide(withdrawal_id, admin, "rejeitado", payload.justification)


@router.post("/withdrawals/{withdrawal_id}/mark-paid", response_model=WithdrawalOut)
async def mark_paid(withdrawal_id: str, admin: Annotated[dict, Depends(current_admin)]):
    doc = await db.withdrawals.find_one({"id": withdrawal_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada.")
    if doc["status"] != "aprovado":
        raise HTTPException(status_code=400, detail="Somente solicitações aprovadas podem ser baixadas.")
    await db.withdrawals.update_one({"id": withdrawal_id}, {"$set": {"paid": True, "paid_at": now_utc()}})
    # Settle the matured investments that funded this payout.
    matured = await db.investments.find(
        {"user_id": doc["user_id"], "status": "concluido", "paid_out": {"$ne": True}}
    ).to_list(500)
    remaining = doc["amount"]
    reference = today_br()
    for inv in matured:
        if remaining <= 0:
            break
        value = project(inv, reference)["accrued_total"]
        await db.investments.update_one({"id": inv["id"]}, {"$set": {"paid_out": True, "paid_out_at": now_utc()}})
        remaining -= value
    await write_audit(
        admin, "resgate.pagamento_registrado", "withdrawal", withdrawal_id, "Pagamento efetivado e registrado"
    )
    return project_withdrawal(await db.withdrawals.find_one({"id": withdrawal_id}))


@router.get("/settings", response_model=AdminSettingsOut)
async def read_settings(admin: Annotated[dict, Depends(current_admin)]):
    settings = await get_settings()
    return {k: settings[k] for k in AdminSettingsOut.model_fields}


@router.put("/settings", response_model=AdminSettingsOut)
async def update_settings(payload: AdminSettingsInput, admin: Annotated[dict, Depends(current_admin)]):
    values = payload.model_dump()
    values["whatsapp_number"] = "".join(ch for ch in values["whatsapp_number"] if ch.isdigit())
    await db.settings.update_one({"key": "global"}, {"$set": values}, upsert=True)
    await write_audit(admin, "configuracao.atualizada", "settings", "global", "Parâmetros operacionais alterados")
    settings = await get_settings()
    return {k: settings[k] for k in AdminSettingsOut.model_fields}


@router.get("/audit", response_model=list[AuditLogOut])
async def audit_logs(admin: Annotated[dict, Depends(current_admin)], limit: int = 200):
    docs = await db.audit_logs.find().sort("created_at", -1).to_list(min(limit, 500))
    return [
        {
            "id": d["id"],
            "actor_email": d.get("actor_email", "sistema"),
            "action": d["action"],
            "target_type": d["target_type"],
            "target_id": d["target_id"],
            "details": d.get("details", ""),
            "created_at": as_utc(d["created_at"]),
        }
        for d in docs
    ]


@router.delete("/clients/{user_id}", response_model=MessageOut)
async def delete_client(user_id: str, admin: Annotated[dict, Depends(current_admin)]):
    """LGPD: exclusão definitiva do titular e de seus registros operacionais."""
    user = await db.users.find_one({"id": user_id, "role": "client"})
    if not user:
        raise HTTPException(status_code=404, detail="Cliente não encontrado.")
    await db.investments.delete_many({"user_id": user_id})
    await db.withdrawals.delete_many({"user_id": user_id})
    await db.sessions.delete_many({"user_id": user_id})
    await db.users.delete_one({"id": user_id})
    await write_audit(admin, "cliente.excluido_lgpd", "user", user_id, f"Exclusão definitiva de {user['email']}")
    return {"message": "Cliente excluído."}
