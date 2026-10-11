"""Tarefa agendada: apuração diária dos rendimentos às 00h (America/Sao_Paulo).

O endpoint apenas autentica, registra a execução e devolve 2xx imediatamente; o trabalho
real roda em background (BackgroundTasks). Idempotente por data de referência.
"""

import hmac
import logging
import os
import uuid
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Request

from lib.business import accrual, business_days_between, now_utc, today_br
from lib.db import db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/cron", tags=["cron"])


def _authorize(authorization: str | None) -> None:
    secret = os.environ.get("WEBHOOK_CRON_SECRET", "")
    if not secret or not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Não autorizado.")
    if not hmac.compare_digest(authorization.removeprefix("Bearer ").strip(), secret):
        raise HTTPException(status_code=401, detail="Não autorizado.")


async def run_daily_accrual(run_id: str) -> None:
    """Fecha a posição do dia para cada investimento ativo, sem duplicar lançamentos."""
    reference = today_br()
    reference_iso = reference.isoformat()
    processed = 0
    completed = 0

    cursor = db.investments.find({"status": {"$in": ["ativo", "concluido"]}})
    for inv in await cursor.to_list(5000):
        start = inv.get("start_date")
        if not start:
            continue
        start_date = start if not isinstance(start, str) else None
        from datetime import date as _date

        start_date = start_date or _date.fromisoformat(str(start)[:10])
        end = inv.get("end_date")
        end_date = _date.fromisoformat(str(end)[:10]) if end else None

        elapsed = business_days_between(start_date, reference)
        if inv["status"] == "concluido":
            elapsed = inv["business_days"]
        nums = accrual(inv["amount"], inv["yield_percent"], inv["business_days"], elapsed)

        # Rollover do período: um investimento vencido passa a concluído uma única vez.
        if inv["status"] == "ativo" and end_date and reference >= end_date:
            result = await db.investments.update_one(
                {"id": inv["id"], "status": "ativo"},
                {"$set": {"status": "concluido", "completed_at": now_utc()}},
            )
            if result.modified_count:
                completed += 1

        # Um snapshot por investimento por data de referência (chave única evita duplicidade).
        await db.daily_accruals.update_one(
            {"investment_id": inv["id"], "reference_date": reference_iso},
            {
                "$set": {
                    "user_id": inv["user_id"],
                    "group_code": inv["group_code"],
                    "amount": inv["amount"],
                    "elapsed_business_days": nums["elapsed_business_days"],
                    "business_days": inv["business_days"],
                    "accrued_yield": nums["accrued_yield"],
                    "accrued_total": nums["accrued_total"],
                    "projected_yield": nums["projected_yield"],
                    "daily_yield": nums["daily_yield"],
                    "updated_at": now_utc(),
                },
                "$setOnInsert": {"id": str(uuid.uuid4()), "created_at": now_utc()},
            },
            upsert=True,
        )
        processed += 1

    await db.audit_logs.insert_one(
        {
            "id": str(uuid.uuid4()),
            "actor_id": None,
            "actor_email": "sistema (apuração automática)",
            "action": "apuracao.diaria",
            "target_type": "cron",
            "target_id": run_id,
            "details": (
                f"Apuração de {reference_iso}: {processed} investimento(s) atualizado(s), "
                f"{completed} concluído(s) no período."
            ),
            "created_at": now_utc(),
        }
    )
    logger.info("apuração diária %s: %s processados, %s concluídos", reference_iso, processed, completed)


@router.post("/daily-accrual")
async def daily_accrual(
    request: Request,
    background: BackgroundTasks,
    authorization: Annotated[str | None, Header()] = None,
    x_webhook_id: Annotated[str | None, Header()] = None,
):
    # Cron endpoints must ack 2xx immediately; enqueue/background the actual work.
    _authorize(authorization)
    try:
        envelope = await request.json()
    except Exception:
        envelope = {}
    run_id = x_webhook_id or envelope.get("run_id") or str(uuid.uuid4())

    # Entrega duplicada: reconhece sem reexecutar.
    if await db.cron_runs.find_one({"run_id": run_id}):
        return {"status": "duplicate", "run_id": run_id}

    await db.cron_runs.insert_one(
        {"run_id": run_id, "schedule": "daily-accrual", "received_at": now_utc()}
    )
    background.add_task(run_daily_accrual, run_id)
    return {"status": "accepted", "run_id": run_id, "reference_date": today_br().isoformat()}
