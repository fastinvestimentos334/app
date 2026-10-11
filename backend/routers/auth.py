"""Auth: register, login, logout, me, password recovery. Sessions are httpOnly cookies."""

import secrets
import uuid
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response

from lib.business import now_utc
from lib.db import db
from lib.security import (
    create_session,
    current_user,
    destroy_session,
    hash_password,
    public_user,
    verify_password,
    write_audit,
)
from models.schemas import (
    ForgotPasswordInput,
    ForgotPasswordOutput,
    LoginInput,
    MessageOut,
    RegisterInput,
    ResetPasswordInput,
    UserOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=201)
async def register(payload: RegisterInput, response: Response):
    email = payload.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="E-mail já cadastrado.")
    if await db.users.find_one({"cpf": payload.cpf}):
        raise HTTPException(status_code=409, detail="CPF já cadastrado.")

    doc = {
        "id": str(uuid.uuid4()),
        "full_name": payload.full_name.strip(),
        "cpf": payload.cpf,
        "email": email,
        "phone": payload.phone,
        "cep": payload.cep,
        "address": payload.address.strip(),
        "number": payload.number.strip(),
        "complement": payload.complement.strip(),
        "district": payload.district.strip(),
        "city": payload.city.strip(),
        "state": payload.state,
        "password_hash": hash_password(payload.password),
        "role": "client",
        "accepted_terms_at": now_utc(),
        "created_at": now_utc(),
    }
    await db.users.insert_one(dict(doc))
    await create_session(response, doc["id"])
    await write_audit(doc, "cliente.cadastro", "user", doc["id"], "Cadastro concluído com aceite dos termos")
    return public_user(doc)


@router.post("/login", response_model=UserOut)
async def login(payload: LoginInput, response: Response):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos.")
    await create_session(response, user["id"])
    await write_audit(user, "sessao.login", "user", user["id"], "Login realizado")
    return public_user(user)


@router.post("/logout", response_model=MessageOut)
async def logout(response: Response, fast_session: Annotated[str | None, Cookie()] = None):
    await destroy_session(response, fast_session)
    return {"message": "Sessão encerrada."}


@router.get("/me", response_model=UserOut)
async def me(user: Annotated[dict, Depends(current_user)]):
    return public_user(user)


@router.post("/forgot-password", response_model=ForgotPasswordOutput)
async def forgot_password(payload: ForgotPasswordInput):
    user = await db.users.find_one({"email": payload.email.lower()})
    generic = "Se o e-mail estiver cadastrado, um código de redefinição foi gerado."
    if not user:
        return {"message": generic, "reset_token": None}
    token = secrets.token_urlsafe(24)
    await db.reset_tokens.insert_one(
        {
            "token": token,
            "user_id": user["id"],
            "created_at": now_utc(),
            "expires_at": now_utc() + timedelta(minutes=30),
        }
    )
    await write_audit(user, "senha.recuperacao_solicitada", "user", user["id"], "Código de redefinição gerado")
    return {"message": generic, "reset_token": token}


@router.post("/reset-password", response_model=MessageOut)
async def reset_password(payload: ResetPasswordInput):
    entry = await db.reset_tokens.find_one({"token": payload.token})
    if not entry:
        raise HTTPException(status_code=400, detail="Código inválido ou expirado.")
    user = await db.users.find_one({"id": entry["user_id"]})
    if not user:
        raise HTTPException(status_code=400, detail="Código inválido ou expirado.")
    await db.users.update_one({"id": user["id"]}, {"$set": {"password_hash": hash_password(payload.password)}})
    await db.reset_tokens.delete_one({"token": payload.token})
    await db.sessions.delete_many({"user_id": user["id"]})
    await write_audit(user, "senha.redefinida", "user", user["id"], "Senha redefinida pelo titular")
    return {"message": "Senha redefinida com sucesso. Faça login."}
