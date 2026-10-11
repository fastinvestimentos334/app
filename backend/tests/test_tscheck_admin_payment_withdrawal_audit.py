"""Criterion: Painel administrativo protegido por função no servidor — confirmação de pagamento,
aprovação/rejeição de saque com justificativa obrigatória e auditoria.
"""

import uuid

import httpx

BACKEND_URL = "http://localhost:8001"
API_URL = f"{BACKEND_URL}/api"

ADMIN_EMAIL = "fastinvestimento334@gmail.com"
ADMIN_PASSWORD = "Freitas24."


def _gen_valid_cpf() -> str:
    import random

    base = [random.randint(0, 9) for _ in range(9)]
    for size in (9, 10):
        total = sum(base[i] * (size + 1 - i) for i in range(size))
        check = (total * 10) % 11
        base.append(0 if check == 10 else check)
    return "".join(str(d) for d in base)


def _new_client_session():
    email = f"tscheck-admin-{uuid.uuid4().hex[:10]}@exemplo.com"
    payload = {
        "full_name": "Tscheck Admin Flow Client",
        "cpf": _gen_valid_cpf(),
        "email": email,
        "phone": "11988887777",
        "cep": "01001000",
        "address": "Praca da Se",
        "number": "20",
        "complement": "",
        "district": "Se",
        "city": "Sao Paulo",
        "state": "SP",
        "password": "Teste1234",
        "accept_terms": True,
    }
    c = httpx.Client(base_url=API_URL, timeout=30.0)
    resp = c.post("/auth/register", json=payload)
    assert resp.status_code == 201, resp.text
    return c


def _admin_session():
    c = httpx.Client(base_url=API_URL, timeout=30.0)
    resp = c.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert resp.status_code == 200, resp.text
    return c


def test_client_cannot_access_admin_routes():
    client_session = _new_client_session()
    resp = client_session.get("/admin/summary")
    assert resp.status_code in (401, 403), resp.text


def test_admin_confirm_payment_and_withdrawal_justification_required():
    client_session = _new_client_session()
    admin = _admin_session()

    # client creates an investment -> aguardando_pagamento
    resp = client_session.post("/investments", json={"group_id": "GR100", "modality_id": "MOD_15"})
    assert resp.status_code == 201, resp.text
    investment = resp.json()
    assert investment["status"] == "aguardando_pagamento"

    # admin confirms payment -> ativo
    resp = admin.post(f"/admin/investments/{investment['id']}/confirm-payment")
    assert resp.status_code == 200, resp.text
    confirmed = resp.json()
    assert confirmed["status"] == "ativo"
    assert confirmed["start_date"] is not None

    # admin summary KPIs reachable
    resp = admin.get("/admin/summary")
    assert resp.status_code == 200, resp.text
    assert "pending_withdrawals" in resp.json()

    # audit log contains the payment confirmation entry
    resp = admin.get("/admin/audit")
    assert resp.status_code == 200, resp.text
    actions = [a["action"] for a in resp.json()]
    assert "pagamento.confirmado" in actions

    # withdrawal decision requires justification >= 3 chars (schema enforced -> 422)
    # Use a withdrawal id that doesn't exist just to exercise validation before 404 lookup;
    # FastAPI validates body before the handler runs, so this proves the server-side rule.
    resp = admin.post(
        "/admin/withdrawals/non-existent-id/approve",
        json={"justification": "ok"},
    )
    assert resp.status_code == 422, resp.text

    resp = admin.post(
        "/admin/withdrawals/non-existent-id/approve",
        json={"justification": "justificativa válida"},
    )
    assert resp.status_code == 404, resp.text
