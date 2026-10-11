"""Criterion: Login, logout e recuperação de senha funcionam; rotas privadas bloqueiam acesso anônimo."""

import uuid

import httpx

BACKEND_URL = "http://localhost:8001"
API_URL = f"{BACKEND_URL}/api"


def _gen_valid_cpf() -> str:
    import random

    base = [random.randint(0, 9) for _ in range(9)]
    for size in (9, 10):
        total = sum(base[i] * (size + 1 - i) for i in range(size))
        check = (total * 10) % 11
        base.append(0 if check == 10 else check)
    return "".join(str(d) for d in base)


def _register_client():
    email = f"tscheck-login-{uuid.uuid4().hex[:10]}@exemplo.com"
    payload = {
        "full_name": "Tscheck Login Flow",
        "cpf": _gen_valid_cpf(),
        "email": email,
        "phone": "11988887777",
        "cep": "01001000",
        "address": "Praca da Se",
        "number": "10",
        "complement": "",
        "district": "Se",
        "city": "Sao Paulo",
        "state": "SP",
        "password": "Teste1234",
        "accept_terms": True,
    }
    with httpx.Client(base_url=API_URL, timeout=30.0) as c:
        resp = c.post("/auth/register", json=payload)
        assert resp.status_code == 201, resp.text
    return email, "Teste1234"


def test_login_wrong_credentials_rejected(client):
    resp = client.post("/auth/login", json={"email": "nao-existe-tscheck@exemplo.com", "password": "errada123"})
    assert resp.status_code == 401, resp.text


def test_private_route_blocks_anonymous(client):
    resp = client.get("/investments/dashboard")
    assert resp.status_code in (401, 403), resp.text


def test_login_logout_and_password_recovery_flow():
    email, password = _register_client()
    with httpx.Client(base_url=API_URL, timeout=30.0) as c:
        # fresh client (no session yet) — private route blocked
        resp = c.get("/investments/dashboard")
        assert resp.status_code in (401, 403)

        # login
        resp = c.post("/auth/login", json={"email": email, "password": password})
        assert resp.status_code == 200, resp.text

        # private route now accessible
        resp = c.get("/investments/dashboard")
        assert resp.status_code == 200, resp.text

        # logout
        resp = c.post("/auth/logout")
        assert resp.status_code == 200, resp.text

        # private route blocked again
        resp = c.get("/investments/dashboard")
        assert resp.status_code in (401, 403)

        # password recovery: request code
        resp = c.post("/auth/forgot-password", json={"email": email})
        assert resp.status_code == 200, resp.text
        token = resp.json()["reset_token"]
        assert token

        # reset password with the code
        resp = c.post("/auth/reset-password", json={"token": token, "password": "NovaSenha123"})
        assert resp.status_code == 200, resp.text

        # old password no longer works
        resp = c.post("/auth/login", json={"email": email, "password": password})
        assert resp.status_code == 401

        # new password works
        resp = c.post("/auth/login", json={"email": email, "password": "NovaSenha123"})
        assert resp.status_code == 200, resp.text
