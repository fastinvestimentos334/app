"""Idempotent seed: creates the administrator account and the default settings document.

Run: cd /app/backend && python seed.py
"""

import asyncio
import uuid

from lib.business import now_utc
from lib.db import db, ensure_indexes
from lib.security import DEFAULT_SETTINGS, hash_password

ADMIN_EMAIL = "fastinvestimento334@gmail.com"
ADMIN_PASSWORD = "Freitas24."


async def main() -> None:
    await ensure_indexes()

    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if existing:
        await db.users.update_one(
            {"email": ADMIN_EMAIL},
            {"$set": {"role": "admin", "password_hash": hash_password(ADMIN_PASSWORD)}},
        )
        print(f"admin atualizado: {ADMIN_EMAIL}")
    else:
        await db.users.insert_one(
            {
                "id": str(uuid.uuid4()),
                "full_name": "Administrador FAST",
                "cpf": "00000000191",
                "email": ADMIN_EMAIL,
                "phone": "11999999999",
                "cep": "01001000",
                "address": "Praça da Sé",
                "number": "1",
                "complement": "",
                "district": "Sé",
                "city": "São Paulo",
                "state": "SP",
                "password_hash": hash_password(ADMIN_PASSWORD),
                "role": "admin",
                "accepted_terms_at": now_utc(),
                "created_at": now_utc(),
            }
        )
        print(f"admin criado: {ADMIN_EMAIL}")

    if not await db.settings.find_one({"key": "global"}):
        await db.settings.insert_one(dict(DEFAULT_SETTINGS))
        print("configurações padrão criadas")
    else:
        print("configurações já existem")


if __name__ == "__main__":
    asyncio.run(main())
