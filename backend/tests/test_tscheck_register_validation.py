"""Criterion: Cadastro com validação de CPF, telefone, CEP, endereço e aceite obrigatório dos termos.

Happy path: valid CPF registers and creates a session cookie.
Failure path: invalid CPF is rejected (422) and no account is created.
"""

import random
import uuid


def _gen_valid_cpf() -> str:
    base = [random.randint(0, 9) for _ in range(9)]
    for size in (9, 10):
        total = sum(base[i] * (size + 1 - i) for i in range(size))
        check = (total * 10) % 11
        base.append(0 if check == 10 else check)
    return "".join(str(d) for d in base)


def _payload(**overrides):
    base = {
        "full_name": "Tscheck Register Validation",
        "cpf": _gen_valid_cpf(),
        "email": f"tscheck-register-{uuid.uuid4().hex[:10]}@exemplo.com",
        "phone": "11988887777",
        "cep": "01001000",
        "address": "Praca da Se",
        "number": "100",
        "complement": "",
        "district": "Se",
        "city": "Sao Paulo",
        "state": "SP",
        "password": "Teste1234",
        "accept_terms": True,
    }
    base.update(overrides)
    return base


def test_register_invalid_cpf_rejected(client):
    payload = _payload(cpf="11111111111")
    resp = client.post("/auth/register", json=payload)
    assert resp.status_code == 422, resp.text
    body = resp.text
    assert "cpf" in body.lower() or "CPF" in body


def test_register_missing_terms_rejected(client):
    payload = _payload(accept_terms=False)
    resp = client.post("/auth/register", json=payload)
    assert resp.status_code == 422, resp.text


def test_register_valid_cpf_creates_account(client):
    payload = _payload()
    resp = client.post("/auth/register", json=payload)
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["email"] == payload["email"].lower()
    assert body["role"] == "client"
    # session cookie set
    assert any(c for c in client.cookies)
