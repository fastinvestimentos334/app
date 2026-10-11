import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  UserPlus,
  Wallet,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import WhatsAppButton from "@/components/WhatsAppButton";
import PlatformCarousel from "@/components/PlatformCarousel";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCatalog } from "@/hooks/useAppData";
import { brl, pct } from "@/lib/format";

const FALLBACK_GROUPS = [
  { id: "GR50", code: "GR 50", amount: 50 },
  { id: "GR100", code: "GR 100", amount: 100 },
  { id: "GR200", code: "GR 200", amount: 200 },
  { id: "GR250", code: "GR 250", amount: 250 },
  { id: "GR300", code: "GR 300", amount: 300 },
  { id: "GR400", code: "GR 400", amount: 400 },
  { id: "GR500", code: "GR 500", amount: 500 },
  { id: "GR700", code: "GR 700", amount: 700 },
  { id: "GR800", code: "GR 800", amount: 800 },
  { id: "GR1000", code: "GR 1000", amount: 1000 },
];

const STEPS = [
  {
    icon: UserPlus,
    title: "Crie sua conta",
    text: "Cadastro completo com CPF, telefone e endereço. Seus dados são protegidos conforme a LGPD.",
  },
  {
    icon: Wallet,
    title: "Escolha o grupo",
    text: "Dez grupos disponíveis, de GR 50 a GR 1000, com valor de entrada definido em cada cartão.",
  },
  {
    icon: CalendarCheck,
    title: "Defina a modalidade",
    text: "15 dias úteis com projeção de 15% ou 30 dias úteis com projeção de 35%, apurados dia a dia.",
  },
  {
    icon: CreditCard,
    title: "Pague pelo link oficial",
    text: "O checkout direciona para o link de pagamento oficial definido pela administração da plataforma.",
  },
  {
    icon: BarChart3,
    title: "Acompanhe a apuração",
    text: "O servidor atualiza a apuração às 00h (America/Sao_Paulo) seguindo o calendário de dias úteis.",
  },
  {
    icon: ShieldCheck,
    title: "Solicite o resgate",
    text: "Ao fim do período, solicite o resgate. Toda liberação passa por aprovação manual com auditoria.",
  },
];

const PILLARS = [
  {
    icon: BarChart3,
    title: "Cálculo no servidor",
    text: "Toda apuração é processada no backend, no fuso America/Sao_Paulo, com atualização às 00h e sem duplicidade de lançamentos.",
  },
  {
    icon: Lock,
    title: "Dados protegidos",
    text: "Senhas com derivação criptográfica PBKDF2-SHA256, sessões em cookies httpOnly e controle de acesso por função no servidor.",
  },
  {
    icon: ShieldCheck,
    title: "Aprovação manual de resgates",
    text: "Nenhuma liberação é automática: cada solicitação é analisada pela administração com justificativa e registro de auditoria.",
  },
  {
    icon: CreditCard,
    title: "Pagamento por link oficial",
    text: "O checkout utiliza exclusivamente o link de pagamento determinado pela administração da plataforma.",
  },
];

const FAQ = [
  {
    q: "O que é um grupo de investimento na FAST?",
    a: "Cada grupo representa um valor de entrada fixo — de R$ 50,00 (GR 50) a R$ 1.000,00 (GR 1000). Ao escolher um grupo você define também a modalidade de prazo, e o sistema passa a apurar a evolução diariamente.",
  },
  {
    q: "Como funciona a contagem de dias úteis?",
    a: "O cálculo é feito no servidor, no fuso America/Sao_Paulo, considerando apenas dias úteis — sábados, domingos e feriados nacionais são desconsiderados. O rendimento do período é dividido linearmente pelo número de dias úteis da modalidade.",
  },
  {
    q: "Qual a diferença entre valor projetado e valor apurado?",
    a: "O valor projetado é o resultado total previsto para o fim do período da modalidade. O valor apurado é o quanto já foi efetivamente computado até a data de referência, proporcional aos dias úteis decorridos.",
  },
  {
    q: "Como é feito o pagamento do aporte?",
    a: "Todos os pagamentos de grupos são direcionados ao link oficial determinado pela administração. Após a confirmação do pagamento pela administração, o investimento é ativado e o período começa a contar no próximo dia útil.",
  },
  {
    q: "Como funciona o resgate?",
    a: "Você solicita o resgate na página de Saques informando a chave PIX. Toda solicitação passa por aprovação manual da administração, com registro de auditoria. A aprovação administrativa não se confunde com a confirmação do pagamento, que é registrada em etapa separada.",
  },
  {
    q: "Como falo com um atendente humano?",
    a: "O botão flutuante de WhatsApp está disponível em todas as páginas e direciona para o número oficial de atendimento configurado pela administração.",
  },
];

export default function Landing() {
  const { data: catalog } = useCatalog();
  const groups = catalog?.groups ?? FALLBACK_GROUPS;
  const modalities = catalog?.modalities ?? [];
  const [step, setStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-svh bg-[#1C1E21] text-[#F2F4F7]">
      <SiteHeader />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-[#004D40]/25 blur-[140px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, #000 40%, transparent 100%)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-5 pt-14 pb-16 sm:px-8 sm:pt-20 sm:pb-24 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">
            <div className="animate-fade-up">
              <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] text-[#00E676] uppercase">
                <span className="h-px w-8 bg-[#00E676]/60" aria-hidden />
                Seu futuro em boas mãos
              </p>
              <h1 className="mt-6 text-[2rem] leading-[1.08] font-semibold text-white sm:text-5xl lg:text-[3.5rem]">
                Grupos de investimento com
                <span className="text-[#00E676]"> apuração diária</span> e acompanhamento transparente
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[#A8B0BA] sm:text-base">
                A FAST INVESTIMENTOS organiza seu aporte em grupos de valor fixo e modalidades de prazo em dias
                úteis. Todo o cálculo é feito no servidor, com separação clara entre valores projetados,
                apurados, pagos e disponíveis.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/cadastro"
                  data-testid="hero-register-cta"
                  className={
                    buttonVariants({ size: "lg" }) +
                    " h-13 rounded-xl bg-[#00E676] px-7 text-[15px] font-semibold text-[#062315] shadow-[0_12px_30px_-12px_rgba(0,230,118,0.5)] transition-all duration-200 hover:bg-[#13f083] hover:shadow-[0_16px_36px_-12px_rgba(0,230,118,0.6)] active:scale-[0.985]"
                  }
                >
                  Criar minha conta <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <a
                  href="#grupos"
                  data-testid="hero-groups-cta"
                  className={
                    buttonVariants({ size: "lg", variant: "outline" }) +
                    " h-13 rounded-xl border-white/12 bg-white/[0.03] px-7 text-[15px] text-white transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.07]"
                  }
                >
                  Ver grupos disponíveis
                </a>
              </div>

              <dl className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-6 border-t border-white/[0.07] pt-7">
                {[
                  { k: "Grupos disponíveis", v: "10" },
                  { k: "Entrada mínima", v: "R$ 50" },
                  { k: "Apuração", v: "Diária" },
                ].map((item) => (
                  <div key={item.k}>
                    <dt className="text-[11px] tracking-[0.1em] text-[#7D8794] uppercase">{item.k}</dt>
                    <dd className="mt-1.5 font-mono text-xl font-semibold text-white">{item.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Illustrative panel */}
            <div
              className="animate-rise relative rounded-[1.75rem] border border-white/[0.09] bg-gradient-to-br from-[#23262B] to-[#191C20] p-6 shadow-[0_40px_80px_-40px_rgba(0,0,0,1)] sm:p-8"
              data-testid="hero-dashboard-illustration"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-[#00E676] uppercase">
                  Painel ilustrativo
                </p>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] tracking-wide text-[#9AA5B1]">
                  Exemplo de interface
                </span>
              </div>

              <div className="mt-7">
                <p className="text-[11px] tracking-[0.1em] text-[#7D8794] uppercase">Total investido</p>
                <p className="mt-1.5 font-mono text-[2rem] leading-none font-semibold text-white sm:text-[2.5rem]">
                  {brl(1500)}
                </p>
              </div>

              <div className="mt-7 grid grid-cols-2 divide-x divide-white/[0.07] border-y border-white/[0.07] py-5">
                <div className="pr-5">
                  <p className="text-[11px] tracking-[0.08em] text-[#7D8794] uppercase">Projetado</p>
                  <p className="mt-1.5 font-mono text-lg font-semibold text-[#D6DCE4]">{brl(425)}</p>
                </div>
                <div className="pl-5">
                  <p className="text-[11px] tracking-[0.08em] text-[#7D8794] uppercase">Apurado</p>
                  <p className="mt-1.5 font-mono text-lg font-semibold text-[#00E676]">{brl(141.67)}</p>
                </div>
              </div>

              {/* refined sparkline */}
              <div className="mt-6">
                <svg viewBox="0 0 320 90" className="h-24 w-full" preserveAspectRatio="none" aria-hidden>
                  <defs>
                    <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00E676" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#00E676" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 78 L29 74 L58 69 L87 61 L116 56 L145 47 L174 42 L203 33 L232 27 L261 19 L290 13 L320 7 L320 90 L0 90 Z"
                    fill="url(#sparkFill)"
                  />
                  <path
                    d="M0 78 L29 74 L58 69 L87 61 L116 56 L145 47 L174 42 L203 33 L232 27 L261 19 L290 13 L320 7"
                    fill="none"
                    stroke="#00E676"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="1000"
                    className="animate-draw"
                  />
                </svg>
                <div className="mt-2 flex justify-between font-mono text-[10px] text-[#6B7480]">
                  <span>D1</span>
                  <span>D15</span>
                  <span>D30</span>
                </div>
              </div>

              <p className="mt-5 text-xs leading-relaxed text-[#7D8794]">
                Evolução por dia útil — valores de exemplo para ilustrar a interface.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ────────────────────────────────────── */}
      <section id="como-funciona" className="border-t border-white/[0.07] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[#00E676] uppercase">
                Como funciona
              </p>
              <h2 className="mt-4 max-w-xl text-2xl font-semibold text-white sm:text-[2rem]">
                Seis etapas, do cadastro ao resgate
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#8A94A0]">
              Um fluxo objetivo, com confirmação da administração em cada ponto sensível.
            </p>
          </div>

          {/* mobile carousel */}
          <div className="mt-10 lg:hidden">
            <div
              className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#24272C] to-[#1B1E22] p-6"
              data-testid="carousel-card"
            >
              {(() => {
                const Icon = STEPS[step].icon;
                return (
                  <>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-[#00E676]">
                        {String(step + 1).padStart(2, "0")}
                      </span>
                      <span className="h-px flex-1 bg-white/[0.08]" aria-hidden />
                      <Icon className="h-5 w-5 text-[#00E676]" strokeWidth={1.6} />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-white">{STEPS[step].title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-[#A8B0BA]">{STEPS[step].text}</p>
                  </>
                );
              })()}
            </div>
            <div className="mt-5 flex items-center justify-between">
              <Button
                variant="outline"
                size="icon-lg"
                data-testid="carousel-prev"
                aria-label="Etapa anterior"
                className="rounded-xl border-white/12 bg-white/[0.03]"
                onClick={() => setStep((s) => (s - 1 + STEPS.length) % STEPS.length)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2" data-testid="carousel-dots">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-px transition-all duration-300 ${
                      i === step ? "w-8 bg-[#00E676]" : "w-4 bg-white/20"
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon-lg"
                data-testid="carousel-next"
                aria-label="Próxima etapa"
                className="rounded-xl border-white/12 bg-white/[0.03]"
                onClick={() => setStep((s) => (s + 1) % STEPS.length)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* desktop: numbered editorial grid */}
          <div className="mt-12 hidden gap-x-10 gap-y-12 lg:grid lg:grid-cols-3">
            {STEPS.map((item, i) => (
              <div
                key={item.title}
                data-testid={`step-card-${i + 1}`}
                className="group border-t border-white/[0.09] pt-6 transition-colors duration-300 hover:border-[#00E676]/50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#00E676]">{String(i + 1).padStart(2, "0")}</span>
                  <item.icon
                    className="h-5 w-5 text-[#6B7480] transition-colors duration-300 group-hover:text-[#00E676]"
                    strokeWidth={1.6}
                  />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#8A94A0]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODALIDADES ──────────────────────────────────────── */}
      <section className="border-t border-white/[0.07] bg-[#17191C] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-[#00E676] uppercase">Modalidades</p>
          <h2 className="mt-4 text-2xl font-semibold text-white sm:text-[2rem]">
            Prazos em dias úteis e projeção do período
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6">
            {modalities.length === 0
              ? [1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/[0.07] bg-[#1F2226] p-7"
                    data-testid={`modality-placeholder-${i}`}
                  >
                    <p className="text-sm text-[#8A94A0]">
                      Modalidades de 15 e 30 dias úteis — carregando informações do servidor.
                    </p>
                  </div>
                ))
              : modalities.map((m, i) => (
                  <div
                    key={m.id}
                    data-testid={`modality-card-${m.id}`}
                    className={`relative overflow-hidden rounded-2xl border p-7 sm:p-8 ${
                      i === 1
                        ? "border-[#00E676]/25 bg-gradient-to-br from-[#014A3E] to-[#01302A] shadow-[0_24px_60px_-34px_rgba(0,230,118,0.4)]"
                        : "border-white/[0.09] bg-gradient-to-br from-[#24272C] to-[#1B1E22]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm text-[#A8B0BA]">{m.name}</p>
                      <span className="rounded-full border border-[#00E676]/30 bg-[#00E676]/10 px-3 py-1 font-mono text-[11px] text-[#00E676]">
                        {m.business_days} dias úteis
                      </span>
                    </div>
                    <p className="mt-6 font-mono text-[3rem] leading-none font-semibold text-[#00E676]">
                      {pct(m.yield_percent)}
                    </p>
                    <p className="mt-5 text-sm leading-relaxed text-[#C7CED6]">{m.description}</p>
                    <p className="mt-6 border-t border-white/[0.09] pt-5 text-xs leading-relaxed text-[#8A94A0]">
                      Divisão linear de {pct(m.yield_percent / m.business_days)} por dia útil ao longo de{" "}
                      {m.business_days} dias úteis.
                    </p>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* ── GRUPOS ───────────────────────────────────────────── */}
      <section id="grupos" className="border-t border-white/[0.07] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[#00E676] uppercase">Grupos</p>
              <h2 className="mt-4 text-2xl font-semibold text-white sm:text-[2rem]">
                Dez grupos, de R$ 50,00 a R$ 1.000,00
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#8A94A0]">
              Escolha o grupo, selecione a modalidade e siga para o checkout com o link oficial de pagamento.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {groups.map((group) => (
              <Link
                key={group.id}
                to="/cadastro"
                data-testid={`landing-group-card-${group.id.toLowerCase()}`}
                className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#23262B] to-[#1B1E22] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#00E676]/45 hover:shadow-[0_22px_44px_-26px_rgba(0,230,118,0.4)]"
              >
                <span
                  className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-[#00E676] to-transparent transition-transform duration-300 group-hover:scale-x-100"
                  aria-hidden
                />
                <p className="text-xs tracking-[0.1em] text-[#7D8794] uppercase">{group.code}</p>
                <p className="mt-3 font-mono text-lg font-semibold text-white sm:text-xl">
                  {brl(group.amount)}
                </p>
                <p className="mt-4 flex items-center gap-1.5 text-[11px] text-[#7D8794] transition-colors duration-200 group-hover:text-[#00E676]">
                  Ver detalhes
                  <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRANSPARÊNCIA ────────────────────────────────────── */}
      {/* ── APRESENTAÇÃO DA PLATAFORMA ───────────────────────── */}
      <section className="border-t border-white/[0.07] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[#00E676] uppercase">
                Conheça a plataforma
              </p>
              <h2 className="mt-4 max-w-xl text-2xl font-semibold text-white sm:text-[2rem]">
                Veja como você acompanha cada centavo
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#8A94A0]">
              Telas reais do produto: painel, evolução diária, grupos e o fluxo de resgate auditado.
            </p>
          </div>
          <div className="mt-10">
            <PlatformCarousel />
          </div>
        </div>
      </section>

      {/* ── POR QUE A FAST ───────────────────────────────────── */}
      <section id="transparencia" className="border-t border-white/[0.07] bg-[#17191C] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-16">
            <div className="lg:sticky lg:top-28">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[#00E676] uppercase">
                Por que a FAST
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-white sm:text-[2rem]">
                Regras claras e registros auditáveis
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-[#A8B0BA]">
                Nada de caixa-preta: você vê o valor projetado, o que já foi apurado, o que está disponível e o
                que foi pago — com o cálculo rodando no servidor e cada decisão administrativa registrada.
              </p>
              <dl className="mt-9 grid grid-cols-2 gap-6 border-t border-white/[0.07] pt-7">
                {[
                  { k: "Grupos disponíveis", v: "10" },
                  { k: "Entrada mínima", v: "R$ 50" },
                  { k: "Modalidades", v: "15 / 30" },
                  { k: "Apuração", v: "00h diária" },
                ].map((item) => (
                  <div key={item.k}>
                    <dt className="text-[11px] tracking-[0.1em] text-[#7D8794] uppercase">{item.k}</dt>
                    <dd className="mt-1.5 font-mono text-lg font-semibold text-white">{item.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="divide-y divide-white/[0.07]">
              {PILLARS.map((item) => (
                <div
                  key={item.title}
                  className="flex gap-5 py-6"
                  data-testid={`transparency-item-${item.title.length}`}
                >
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-[#00E676]" strokeWidth={1.6} />
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#8A94A0]">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="border-t border-white/[0.07] py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-[#00E676] uppercase">
            Perguntas frequentes
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-white sm:text-[2rem]">Tire suas dúvidas</h2>

          <div className="mt-10 divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {FAQ.map((item, index) => {
              const open = openFaq === index;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    data-testid={`faq-toggle-${index}`}
                    onClick={() => setOpenFaq(open ? null : index)}
                    className="flex min-h-16 w-full items-center justify-between gap-5 py-5 text-left transition-colors duration-200 hover:text-[#00E676]"
                  >
                    <span className="text-[15px] font-medium text-white sm:text-base">{item.q}</span>
                    {open ? (
                      <Minus className="h-4 w-4 shrink-0 text-[#00E676]" />
                    ) : (
                      <Plus className="h-4 w-4 shrink-0 text-[#7D8794]" />
                    )}
                  </button>
                  {open && (
                    <p
                      data-testid={`faq-answer-${index}`}
                      className="animate-fade-up pr-8 pb-6 text-sm leading-relaxed text-[#A8B0BA]"
                    >
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/[0.07] bg-gradient-to-br from-[#014A3E] to-[#012A23] py-16 sm:py-20">
        <div
          className="pointer-events-none absolute -bottom-32 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-[#00E676]/15 blur-[120px]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="text-2xl font-semibold text-white sm:text-[2rem]">Pronto para começar a investir?</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#A7F3D0] sm:text-base">
            Crie sua conta, escolha um grupo e acompanhe a apuração diária no seu painel.
          </p>
          <Link
            to="/cadastro"
            data-testid="footer-register-cta"
            className={
              buttonVariants({ size: "lg" }) +
              " mt-9 h-13 rounded-xl bg-[#00E676] px-8 text-[15px] font-semibold text-[#062315] shadow-[0_14px_34px_-14px_rgba(0,230,118,0.6)] transition-all duration-200 hover:bg-[#13f083] active:scale-[0.985]"
            }
          >
            Criar minha conta <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-[#15181B] py-14">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-md">
              <img
                src="/logo-fast.png"
                alt="FAST INVESTIMENTOS"
                className="h-10 w-auto object-contain mix-blend-lighten"
              />
              <p className="mt-5 text-xs leading-relaxed text-[#7D8794]">
                Plataforma de gestão de grupos de investimento com apuração diária em dias úteis. Os
                percentuais de cada modalidade referem-se à projeção do período contratado e os valores
                apurados são proporcionais aos dias úteis decorridos.
              </p>
            </div>
            <div className="text-sm">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#7D8794] uppercase">
                Institucional
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <Link
                  to="/termos"
                  data-testid="footer-terms-link"
                  className="text-[#A8B0BA] transition-colors duration-200 hover:text-[#00E676]"
                >
                  Termos de uso
                </Link>
                <Link
                  to="/privacidade"
                  data-testid="footer-privacy-link"
                  className="text-[#A8B0BA] transition-colors duration-200 hover:text-[#00E676]"
                >
                  Política de privacidade (LGPD)
                </Link>
                <Link
                  to="/login"
                  data-testid="footer-login-link"
                  className="text-[#A8B0BA] transition-colors duration-200 hover:text-[#00E676]"
                >
                  Área do cliente
                </Link>
              </div>
            </div>
          </div>
          <p className="mt-12 border-t border-white/[0.07] pt-7 text-xs text-[#6B7480]">
            © {new Date().getFullYear()} FAST INVESTIMENTOS. Atendimento humano pelo WhatsApp no número oficial
            configurado pela administração.
          </p>
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  );
}
