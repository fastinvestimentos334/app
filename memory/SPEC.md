# FAST INVESTIMENTOS — Especificação viva

## O que o app faz
Plataforma financeira (pt-BR, mobile-first, tema grafite/esmeralda/menta) para contratação e
acompanhamento de **grupos de investimento**. Cliente escolhe um grupo (valor fixo), uma
modalidade de prazo em dias úteis, paga pelo link oficial do administrador e acompanha a
apuração diária. Resgates passam por aprovação manual do administrador com auditoria.

## Stack
FastAPI + motor/MongoDB (`/app/backend`) · Vite + React 19 + TS strict + Tailwind v4 + shadcn
(`/app/frontend`). Todas as rotas no `api_router` com prefixo `/api`. Sessões em cookie
httpOnly (`fast_session`), senha com PBKDF2-SHA256.

## Catálogo (servidor — `backend/lib/business.py`)
Grupos: GR 50 (R$50), GR 100, GR 200, GR 250, GR 300, GR 400, GR 500, GR 700, GR 800, GR 1000.
Modalidades: `MOD_15` = 15 dias úteis / 15% no período · `MOD_30` = 30 dias úteis / 35% no período.
Apuração **linear por dia útil**: rendimento total ÷ dias úteis da modalidade.
Calendário: dias úteis brasileiros (fins de semana + feriados nacionais fixos e móveis).
Fuso de referência: **America/Sao_Paulo** (rollover às 00h).

## Modelo de dados (coleções)
- `users` — id, full_name, cpf, email, phone, endereço completo, password_hash, role (`client`|`admin`)
- `sessions` — token, user_id, expires_at (TTL)
- `reset_tokens` — token, user_id, expires_at (TTL 30min)
- `investments` — group_id/code, amount, modality_id/name, business_days, yield_percent,
  status (`aguardando_pagamento`|`ativo`|`concluido`|`cancelado`), start_date, end_date, paid_out
- `withdrawals` — amount, pix_key, status (`pendente`|`aprovado`|`rejeitado`), justification, paid
- `audit_logs` — actor_email, action, target_type, target_id, details, created_at
- `settings` (key=`global`) — payment_link, whatsapp_number, whatsapp_message, support_email, company_name

## Fluxos principais
1. **Cadastro** `/cadastro` → nome, CPF (validado com dígitos verificadores), e-mail, telefone,
   CEP (auto-preenche via ViaCEP), endereço, número, complemento, bairro, cidade, UF, senha,
   aceite dos termos. Explicação do uso do CPF abaixo do campo.
2. **Login** `/login` · **Recuperação** `/recuperar-senha` (gera código de 30min, redefine senha).
3. **Painel** `/painel` → saudação, Total investido, Resultado acumulado (apurado vs projetado,
   disponível, já pago), botão COMEÇAR A INVESTIR, lista Meus investimentos, Histórico, Suporte.
4. **Grupos** `/grupos` → 10 cartões → diálogo com modalidades → cria investimento → `/checkout/:id`.
5. **Checkout** → link oficial de pagamento (configurado no admin).
6. **Detalhe** `/investimento/:id` → gráfico de linha compacto (recharts) + cronograma por dia útil.
7. **Saques** `/saques` → saldo disponível (só investimentos concluídos, menos reservas), solicitação
   com chave PIX, histórico com parecer.
8. **Admin** `/admin` (role admin) → KPIs, saques (aprovar/rejeitar com justificativa obrigatória,
   registrar pagamento), investimentos (confirmar pagamento → ativa e agenda o período),
   clientes (busca, exclusão LGPD), configurações, auditoria.
9. **WhatsApp flutuante** em todas as páginas, número do admin, `bottom-4 right-4`, páginas com `pb-28`.

## Regras de valor
- `projetado` = amount × yield% (período integral) · `apurado` = projetado × diasDecorridos/diasTotais
- `disponível` = soma dos concluídos não pagos − pedidos pendentes/aprovados
- Investimento ativo vencido vira `concluido` no servidor (sem duplicidade).

## Papéis
- `client` — painel, grupos, checkout, detalhes, saques, histórico.
- `admin` — tudo acima + `/admin`; todas as rotas `/api/admin/*` exigem `current_admin` no servidor.

## Credenciais
Ver `memory/test_credentials.md`. Seed: `cd /app/backend && python seed.py` (idempotente).

## Links de pagamento e suporte (configuráveis no admin)
- `settings.payment_link` — link padrão do checkout.
- `settings.group_payment_links` — mapa `group_id → URL`, **um link de checkout por grupo**
  (GR50…GR1000). Em branco, o grupo cai no link padrão. Resolvido em
  `lib/security.resolve_payment_link()` e devolvido em `InvestmentOut.payment_link`.
- `settings.whatsapp_link` — link de suporte completo (override). Em branco, o servidor monta
  `wa.me/<numero>?text=<mensagem>` via `resolve_support_link()`. Exposto em `/api/catalog` e
  consumido pelo botão flutuante em todas as páginas.
- Validação: links devem começar com `http://` ou `https://`; grupo inexistente → 400.

## Apuração diária automática (cron da plataforma)
- `.emergent/crons.yml` → `daily-accrual`, `0 0 * * *` no fuso `America/Sao_Paulo`.
- Endpoint: `POST /api/cron/daily-accrual`, autenticado por `Authorization: Bearer
  $WEBHOOK_CRON_SECRET` (em `backend/.env`); responde 2xx imediatamente e executa em background.
- Idempotência: `cron_runs.run_id` evita reprocessar entregas duplicadas; `daily_accruals` tem um
  snapshot por `(investment_id, reference_date)`, impedindo duplicidade de lançamentos.
- Efeitos: grava o apurado do dia por investimento, faz o rollover `ativo → concluido` no
  vencimento (uma única vez) e registra `apuracao.diaria` na auditoria.

## Sistema visual (refinamento premium)
- Base grafite `#1C1E21` (65%), esmeralda `#004D40` (25%), menta `#00E676` (10%).
- Superfícies: cartões com gradiente `#24272C → #1B1E22`, bordas hairline `white/[0.07]` e sombra
  difusa; superfícies internas em `#15181B`; painéis esmeralda com gradiente `#014A3E → #012E27`.
- Tipografia: Sora (títulos, tracking -0.025em), DM Sans (texto), JetBrains Mono com
  `tabular-nums` em todo valor monetário para alinhamento em coluna.
- Rótulos overline em menta (11px, tracking 0.2em, maiúsculas); réguas finas substituem caixas
  pesadas no FAQ, transparência e "como funciona".
- Movimento discreto: `animate-fade-up`, `animate-rise`, `animate-draw` (sparkline do hero);
  transições por propriedade específica, sem `transition: all` e sem pulsação no CTA.
- Logo oficial aplicada com `mix-blend-lighten` para dissolver o fundo escuro do PNG.
- Limpeza de dados de teste: `cd /app/backend && python cleanup_test_data.py`.
