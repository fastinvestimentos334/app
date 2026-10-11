"""Limpa contas e registros criados por testes automatizados, preservando o administrador.

Uso: cd /app/backend && python cleanup_test_data.py
"""

import asyncio
import re

from lib.db import db

KEEP_EMAILS = {"fastinvestimento334@gmail.com"}
TEST_PATTERNS = [
    r"tscheck",
    r"@exemplo\.com$",
    r"@example\.com$",
    r"^smoke\.",
    r"^ui\.teste\.",
    r"teste.*@",
]


async def main() -> None:
    users = await db.users.find().to_list(2000)
    removed = 0
    for user in users:
        email = (user.get("email") or "").lower()
        if email in KEEP_EMAILS or user.get("role") == "admin":
            continue
        if any(re.search(p, email) for p in TEST_PATTERNS):
            await db.investments.delete_many({"user_id": user["id"]})
            await db.withdrawals.delete_many({"user_id": user["id"]})
            await db.sessions.delete_many({"user_id": user["id"]})
            await db.reset_tokens.delete_many({"user_id": user["id"]})
            await db.users.delete_one({"id": user["id"]})
            removed += 1

    # Remove órfãos de execuções anteriores.
    valid_ids = {u["id"] for u in await db.users.find({}, {"id": 1}).to_list(2000)}
    for collection in ("investments", "withdrawals", "sessions"):
        docs = await db[collection].find({}, {"user_id": 1}).to_list(5000)
        orphans = [d["_id"] for d in docs if d.get("user_id") not in valid_ids]
        if orphans:
            await db[collection].delete_many({"_id": {"$in": orphans}})
            print(f"{collection}: {len(orphans)} órfão(s) removido(s)")

    await db.audit_logs.delete_many({})
    print(f"contas de teste removidas: {removed}")
    print(f"clientes restantes: {await db.users.count_documents({'role': 'client'})}")
    print(f"investimentos restantes: {await db.investments.count_documents({})}")


if __name__ == "__main__":
    asyncio.run(main())
