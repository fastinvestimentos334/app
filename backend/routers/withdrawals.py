"""Client withdrawal requests. Every release passes through manual admin approval."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from lib.business import as_utc, money, now_utc
from lib.db import db
from lib.security import current_user, write_audit
from models.schemas import WithdrawalCreate, WithdrawalOut

router = APIRouter(prefix="/withdrawals", tags=["withdrawals"])


def project_withdrawal(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "user_id": doc["user_id"],
        "user_name": doc.get("user_name", ""),
        "amount": doc["amount"],
        "pix_key": doc["pix_key"],
        "status": doc["status"],
        "justification": doc.get("justification", ""),
        "created_at": as_utc(doc["created_at"]),
        "decided_at": as_utc(doc["decided_at"]) if doc.get("decided_at") else None,
        "decided_by": doc.get("decided_by", ""),
        "paid": bool(doc.get("paid", False)),
        "paid_at": as_utc(doc["paid_at"]) if doc.get("paid_at") else None,
    }


async def available_balance(user_id: str) -> float:
    """Matured (concluded, unpaid) principal + yield, minus amounts already reserved."""
    from routers.investments import project  # local import avoids a circular module load

    from lib.business import today_br

    reference = today_br()
    docs = await db.investments.find({"user_id": user_id, "status": "concluido"}).to_list(500)
    matured = sum(project(d, reference)["accrued_total"] for d in docs if not d.get("paid_out", False))
    reserved_docs = await db.withdrawals.find(
        {"user_id": user_id, "status": {"$in": ["pendente", "aprovado"]}}
    ).to_list(500)
    reserved = sum(w["amount"] for w in reserved_docs)
    return money(max(0.0, matured - reserved))


@router.get("/balance", response_model=dict)
async def balance(user: Annotated[dict, Depends(current_user)]):
    return {"available_balance": await available_balance(user["id"])}


@router.post("", response_model=WithdrawalOut, status_code=201)
async def request_withdrawal(payload: WithdrawalCreate, user: Annotated[dict, Depends(current_user)]):
    available = await available_balance(user["id"])
    if available <= 0:
        raise HTTPException(
            status_code=400,
            detail="Nenhum valor disponível para resgate. Aguarde a conclusão do período do investimento.",
        )
    if payload.amount > available:
        raise HTTPException(
            status_code=400,
            detail=f"Valor acima do disponível para resgate (R$ {available:.2f}).",
        )
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user["full_name"],
        "amount": money(payload.amount),
        "pix_key": payload.pix_key.strip(),
        "status": "pendente",
        "justification": "",
        "created_at": now_utc(),
        "decided_at": None,
        "decided_by": "",
        "paid": False,
        "paid_at": None,
    }
    await db.withdrawals.insert_one(dict(doc))
    await write_audit(
        user, "resgate.solicitado", "withdrawal", doc["id"], f"Solicitação de R$ {doc['amount']:.2f}"
    )
    return project_withdrawal(doc)


@router.get("", response_model=list[WithdrawalOut])
async def list_withdrawals(user: Annotated[dict, Depends(current_user)]):
    docs = await db.withdrawals.find({"user_id": user["id"]}).sort("created_at", -1).to_list(500)
    return [project_withdrawal(d) for d in docs]
