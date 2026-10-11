"""Client investments: create (checkout), list, dashboard aggregation, detail series, history."""

import uuid
from datetime import date, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from lib.business import (
    GROUPS_BY_ID,
    MODALITIES_BY_ID,
    accrual,
    add_business_days,
    as_utc,
    business_day_series,
    business_days_between,
    money,
    next_business_day,
    now_utc,
    today_br,
)
from lib.db import db
from lib.security import current_user, get_settings, write_audit
from models.schemas import (
    DashboardOut,
    HistoryEntry,
    InvestmentCreate,
    InvestmentDetailOut,
    InvestmentOut,
)

router = APIRouter(prefix="/investments", tags=["investments"])


def _to_date(value) -> date | None:
    """Accepts None, a date, a datetime (naive from motor) or an ISO string."""
    if value is None:
        return None
    if isinstance(value, str):
        return date.fromisoformat(value[:10])
    if isinstance(value, datetime):
        return as_utc(value).date()
    if isinstance(value, date):
        return value
    return None


def project(doc: dict, reference: date, payment_link: str = "") -> dict:
    start = _to_date(doc.get("start_date"))
    end = _to_date(doc.get("end_date"))
    if doc["status"] == "ativo" and start:
        elapsed = business_days_between(start, reference)
    elif doc["status"] == "concluido":
        elapsed = doc["business_days"]
    else:
        elapsed = 0
    nums = accrual(doc["amount"], doc["yield_percent"], doc["business_days"], elapsed)
    return {
        "id": doc["id"],
        "user_id": doc["user_id"],
        "user_name": doc.get("user_name", ""),
        "group_id": doc["group_id"],
        "group_code": doc["group_code"],
        "amount": doc["amount"],
        "modality_id": doc["modality_id"],
        "modality_name": doc["modality_name"],
        "business_days": doc["business_days"],
        "yield_percent": doc["yield_percent"],
        "status": doc["status"],
        "created_at": as_utc(doc["created_at"]),
        "start_date": start,
        "end_date": end,
        "paid_out": bool(doc.get("paid_out", False)),
        "payment_link": payment_link,
        **nums,
    }


async def _auto_complete(doc: dict, reference: date) -> dict:
    """Server-side rollover: an active investment past its end date becomes 'concluido' once."""
    end = _to_date(doc.get("end_date"))
    if doc["status"] == "ativo" and end and reference >= end:
        await db.investments.update_one(
            {"id": doc["id"], "status": "ativo"},
            {"$set": {"status": "concluido", "completed_at": now_utc()}},
        )
        doc = {**doc, "status": "concluido"}
    return doc


@router.post("", response_model=InvestmentOut, status_code=201)
async def create_investment(payload: InvestmentCreate, user: Annotated[dict, Depends(current_user)]):
    group = GROUPS_BY_ID.get(payload.group_id)
    modality = MODALITIES_BY_ID.get(payload.modality_id)
    if not group:
        raise HTTPException(status_code=404, detail="Grupo não encontrado.")
    if not modality:
        raise HTTPException(status_code=404, detail="Modalidade não encontrada.")

    settings = await get_settings()
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "user_name": user["full_name"],
        "group_id": group["id"],
        "group_code": group["code"],
        "amount": group["amount"],
        "modality_id": modality["id"],
        "modality_name": modality["name"],
        "business_days": modality["business_days"],
        "yield_percent": modality["yield_percent"],
        "status": "aguardando_pagamento",
        "created_at": now_utc(),
        "start_date": None,
        "end_date": None,
        "paid_out": False,
    }
    await db.investments.insert_one(dict(doc))
    await write_audit(
        user,
        "investimento.criado",
        "investment",
        doc["id"],
        f"{group['code']} / {modality['name']} — aguardando confirmação de pagamento",
    )
    return project(doc, today_br(), settings["payment_link"])


@router.get("", response_model=list[InvestmentOut])
async def list_investments(user: Annotated[dict, Depends(current_user)]):
    reference = today_br()
    settings = await get_settings()
    docs = await db.investments.find({"user_id": user["id"]}).sort("created_at", -1).to_list(500)
    out = []
    for doc in docs:
        doc = await _auto_complete(doc, reference)
        out.append(project(doc, reference, settings["payment_link"]))
    return out


@router.get("/dashboard", response_model=DashboardOut)
async def dashboard(user: Annotated[dict, Depends(current_user)]):
    reference = today_br()
    settings = await get_settings()
    docs = await db.investments.find({"user_id": user["id"]}).sort("created_at", -1).to_list(500)
    items = []
    for doc in docs:
        doc = await _auto_complete(doc, reference)
        items.append(project(doc, reference, settings["payment_link"]))

    counted = [i for i in items if i["status"] in ("ativo", "concluido")]
    total_invested = money(sum(i["amount"] for i in counted if i["status"] == "ativo"))
    projected = money(sum(i["projected_yield"] for i in counted))
    accrued = money(sum(i["accrued_yield"] for i in counted))

    matured = money(
        sum(i["accrued_total"] for i in items if i["status"] == "concluido" and not i["paid_out"])
    )
    paid_out_total = money(
        sum(i["accrued_total"] for i in items if i["status"] == "concluido" and i["paid_out"])
    )
    withdrawals = await db.withdrawals.find(
        {"user_id": user["id"], "status": {"$in": ["pendente", "aprovado"]}}
    ).to_list(500)
    reserved = money(sum(w["amount"] for w in withdrawals))

    return {
        "greeting_name": user["full_name"].split(" ")[0],
        "total_invested": total_invested,
        "projected_result": projected,
        "accrued_result": accrued,
        "available_balance": money(max(0.0, matured - reserved)),
        "paid_out_total": paid_out_total,
        "active_count": len([i for i in items if i["status"] == "ativo"]),
        "reference_date": reference,
        "investments": items,
    }


@router.get("/history", response_model=list[HistoryEntry])
async def history(user: Annotated[dict, Depends(current_user)]):
    reference = today_br()
    entries: list[dict] = []
    docs = await db.investments.find({"user_id": user["id"]}).to_list(500)
    for doc in docs:
        doc = await _auto_complete(doc, reference)
        item = project(doc, reference)
        entries.append(
            {
                "id": f"{item['id']}-aporte",
                "date": item["created_at"],
                "kind": "aporte",
                "description": f"Aporte {item['group_code']} — {item['modality_name']}",
                "amount": item["amount"],
                "status": item["status"],
            }
        )
        if item["accrued_yield"] > 0:
            entries.append(
                {
                    "id": f"{item['id']}-rendimento",
                    "date": item["created_at"],
                    "kind": "rendimento",
                    "description": (
                        f"Rendimento apurado {item['group_code']} — "
                        f"{item['elapsed_business_days']}/{item['business_days']} dias úteis"
                    ),
                    "amount": item["accrued_yield"],
                    "status": "apurado" if item["status"] == "concluido" else "em apuração",
                }
            )
    for w in await db.withdrawals.find({"user_id": user["id"]}).to_list(500):
        entries.append(
            {
                "id": f"{w['id']}-resgate",
                "date": as_utc(w["created_at"]),
                "kind": "resgate",
                "description": f"Solicitação de resgate — PIX {w['pix_key']}",
                "amount": w["amount"],
                "status": w["status"],
            }
        )
    entries.sort(key=lambda e: e["date"], reverse=True)
    return entries


@router.get("/{investment_id}", response_model=InvestmentDetailOut)
async def investment_detail(investment_id: str, user: Annotated[dict, Depends(current_user)]):
    doc = await db.investments.find_one({"id": investment_id})
    if not doc or (doc["user_id"] != user["id"] and user.get("role") != "admin"):
        raise HTTPException(status_code=404, detail="Investimento não encontrado.")
    reference = today_br()
    doc = await _auto_complete(doc, reference)
    settings = await get_settings()
    item = project(doc, reference, settings["payment_link"])

    start = _to_date(doc.get("start_date")) or reference
    days = business_day_series(start, doc["business_days"])
    series = [{"day": 0, "date": start, "accrued_total": doc["amount"], "accrued_yield": 0.0, "realized": True}]
    for index, day in enumerate(days, start=1):
        nums = accrual(doc["amount"], doc["yield_percent"], doc["business_days"], index)
        series.append(
            {
                "day": index,
                "date": day,
                "accrued_total": nums["accrued_total"],
                "accrued_yield": nums["accrued_yield"],
                "realized": doc["status"] == "concluido" or index <= item["elapsed_business_days"],
            }
        )
    return {"investment": item, "series": series}


# Helpers reused by the admin router when confirming a payment.
async def activate_investment(investment: dict, actor: dict) -> dict:
    start = next_business_day(today_br())
    end = add_business_days(start, investment["business_days"])
    await db.investments.update_one(
        {"id": investment["id"]},
        {
            "$set": {
                "status": "ativo",
                "start_date": start.isoformat(),
                "end_date": end.isoformat(),
                "payment_confirmed_at": now_utc(),
                "payment_confirmed_by": actor["email"],
            }
        },
    )
    await write_audit(
        actor,
        "pagamento.confirmado",
        "investment",
        investment["id"],
        f"Pagamento confirmado — início {start.isoformat()}, término previsto {end.isoformat()}",
    )
    return await db.investments.find_one({"id": investment["id"]})
