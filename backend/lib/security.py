"""Password hashing, httpOnly cookie sessions and role-based access dependencies."""

import hashlib
import hmac
import os
import secrets
import uuid
from datetime import timedelta
from typing import Annotated
from urllib.parse import quote

from fastapi import Cookie, Depends, HTTPException, Response

from lib.business import as_utc, now_utc
from lib.db import db

SESSION_COOKIE = "fast_session"
SESSION_TTL = timedelta(days=7)
_PBKDF2_ROUNDS = 240_000


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), _PBKDF2_ROUNDS).hex()
    return f"pbkdf2_sha256${_PBKDF2_ROUNDS}${salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, rounds, salt, digest = stored.split("$")
        candidate = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), int(rounds)).hex()
    except (ValueError, AttributeError):
        return False
    return hmac.compare_digest(candidate, digest)


async def create_session(response: Response, user_id: str) -> str:
    token = secrets.token_urlsafe(40)
    await db.sessions.insert_one(
        {
            "token": token,
            "user_id": user_id,
            "created_at": now_utc(),
            "expires_at": now_utc() + SESSION_TTL,
        }
    )
    response.set_cookie(
        SESSION_COOKIE,
        token,
        httponly=True,
        samesite="lax",
        secure=os.environ.get("COOKIE_SECURE", "true").lower() == "true",
        max_age=int(SESSION_TTL.total_seconds()),
        path="/",
    )
    return token


async def destroy_session(response: Response, token: str | None) -> None:
    if token:
        await db.sessions.delete_one({"token": token})
    response.delete_cookie(SESSION_COOKIE, path="/")


def public_user(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "full_name": doc["full_name"],
        "cpf": doc["cpf"],
        "email": doc["email"],
        "phone": doc["phone"],
        "cep": doc.get("cep", ""),
        "address": doc.get("address", ""),
        "number": doc.get("number", ""),
        "complement": doc.get("complement", ""),
        "district": doc.get("district", ""),
        "city": doc.get("city", ""),
        "state": doc.get("state", ""),
        "role": doc.get("role", "client"),
        "created_at": as_utc(doc["created_at"]),
    }


async def current_user(fast_session: Annotated[str | None, Cookie()] = None) -> dict:
    if not fast_session:
        raise HTTPException(status_code=401, detail="Sessão não encontrada. Faça login.")
    session = await db.sessions.find_one({"token": fast_session})
    if not session or as_utc(session["expires_at"]) < now_utc():
        raise HTTPException(status_code=401, detail="Sessão expirada. Faça login novamente.")
    user = await db.users.find_one({"id": session["user_id"]})
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado.")
    return user


async def current_admin(user: Annotated[dict, Depends(current_user)]) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acesso restrito ao administrador.")
    return user


async def write_audit(
    actor: dict | None,
    action: str,
    target_type: str,
    target_id: str,
    details: str = "",
) -> None:
    await db.audit_logs.insert_one(
        {
            "id": str(uuid.uuid4()),
            "actor_id": actor["id"] if actor else None,
            "actor_email": actor["email"] if actor else "sistema",
            "action": action,
            "target_type": target_type,
            "target_id": target_id,
            "details": details,
            "created_at": now_utc(),
        }
    )


DEFAULT_SETTINGS = {
    "key": "global",
    "whatsapp_number": "5511999999999",
    "whatsapp_message": "Olá! Preciso de atendimento da FAST INVESTIMENTOS.",
    "whatsapp_link": "",
    "payment_link": "https://pagamento.fastinvestimentos.com.br/checkout",
    "group_payment_links": {},
    "support_email": "atendimento@fastinvestimentos.com.br",
    "company_name": "FAST INVESTIMENTOS",
}


def resolve_payment_link(settings: dict, group_id: str) -> str:
    """Link específico do grupo quando o administrador definiu um; senão, o link geral."""
    per_group = settings.get("group_payment_links") or {}
    return (per_group.get(group_id) or "").strip() or settings.get("payment_link", "")


def resolve_support_link(settings: dict) -> str:
    """Link de suporte: override completo do administrador ou wa.me montado pelo número."""
    override = (settings.get("whatsapp_link") or "").strip()
    if override:
        return override
    number = "".join(ch for ch in settings.get("whatsapp_number", "") if ch.isdigit())
    message = settings.get("whatsapp_message", "")
    return f"https://wa.me/{number}?text={quote(message)}"


async def get_settings() -> dict:
    doc = await db.settings.find_one({"key": "global"})
    if not doc:
        await db.settings.insert_one(dict(DEFAULT_SETTINGS))
        return dict(DEFAULT_SETTINGS)
    merged = {**DEFAULT_SETTINGS, **{k: v for k, v in doc.items() if k != "_id"}}
    return merged
