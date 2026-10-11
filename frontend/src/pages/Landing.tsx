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
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Wallet,
  ChevronDown,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    title: "1. Crie sua conta",
    text: "Cadastro completo com CPF, telefone e endereço. Seus dados são protegidos conforme a LGPD.",
  },
  {
    icon: Wallet,
    title: "2. Escolha o grupo",
    text: "Dez grupos disponíveis, de GR 50 a GR 1000, com valor de entrada definido em cada cartão.",
  },
  {
    icon: CalendarCheck,
    title: "3. Defina a modalidade",
    text: "15 dias úteis com projeção de 15% ou 30 dias úteis com projeção de 35%, apurados dia a dia.",
  },
  {
    icon: CreditCard,
    title: "4. Pague pelo link oficial",
    text: "O checkout direciona para o link de pagamento oficial definido pela administração da plataforma.",
  },
  {
    icon: BarChart3,
    title: "5. Acompanhe a apuração",
    text: "O servidor atualiza a apuração às 00h (America/Sao_Paulo) seguindo o calendário de dias úteis.",
  },
  {
    icon: ShieldCheck,
    title: "6. Solicite o resgate",
    text: "Ao fim do período, solicite o resgate. Toda liberação passa por aprovação manual com auditoria.",
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

  const mod15 = modalities.find((m) => m.id === "MOD_15");
  const mod30 = modalities.find((m) => m.id === "MOD_30");

  return (
    <div className="min-h-svh bg-[#1C1E21] text-[#F5F7FA]">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#2D3239]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&q=70&w=1600)",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1C1E21]/88 to-[#1C1E21]" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
          <div className="animate-fade-up">
            <span className="text-xs font-semibold tracking-[0.18em] text-[#00E676] uppercase">
              Seu futuro em boas mãos
            </span>
            <h1 className="mt-4 text-3xl leading-tight font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Grupos de investimento com apuração diária e acompanhamento transparente
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#CBD5E1] sm:text-base">
              A FAST INVESTIMENTOS organiza seu aporte em grupos de valor fixo e modalidades de prazo em dias
              úteis. Todo o cálculo é feito no servidor, com separação clara entre valores projetados, apurados,
              pagos e disponíveis.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/cadastro"
                data-testid="hero-register-cta"
                className={
                  buttonVariants({ size: "lg" }) +
                  " h-13 bg-[#00E676] text-base font-semibold text-[#0A1F14] hover:bg-[#00c765] active:scale-[0.98]"
                }
              >
                Criar minha conta <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="#grupos"
                data-testid="hero-groups-cta"
                className={
                  buttonVariants({ size: "lg", variant: "outline" }) +
                  " h-13 border-[#004D40] bg-transparent text-base text-white hover:bg-[#004D40]"
                }
              >
                Ver grupos disponíveis
              </a>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#2D3239] bg-[#22252A] p-4">
                <dt className="text-xs text-[#94A3B8]">Grupos</dt>
                <dd className="font-mono text-xl font-bold text-white">10</dd>
              </div>
              <div className="rounded-xl border border-[#2D3239] bg-[#22252A] p-4">
                <dt className="text-xs text-[#94A3B8]">Entrada mínima</dt>
                <dd className="font-mono text-xl font-bold text-white">R$ 50</dd>
              </div>
              <div className="col-span-2 rounded-xl border border-[#004D40] bg-[#004D40]/35 p-4 sm:col-span-1">
                <dt className="text-xs text-[#A7F3D0]">Apuração</dt>
                <dd className="font-mono text-xl font-bold text-[#00E676]">Diária</dd>
              </div>
            </dl>
          </div>

          {/* Illustrative dashboard */}
          <Card
            className="animate-fade-up border-[#2D3239] bg-[#141618] p-5 shadow-2xl sm:p-7"
            data-testid="hero-dashboard-illustration"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-[0.15em] text-[#00E676] uppercase">
                Painel ilustrativo
              </p>
              <Badge className="bg-[#004D40] text-[#A7F3D0]">Exemplo de interface</Badge>
            </div>
            <div className="mt-5 rounded-xl border border-[#2D3239] bg-[#22252A] p-4">
              <p className="text-xs text-[#94A3B8]">Total investido</p>
              <p className="font-mono text-2xl font-bold text-white sm:text-3xl">{brl(1500)}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#004D40] bg-[#004D40]/30 p-4">
                <p className="text-xs text-[#A7F3D0]">Projetado</p>
                <p className="font-mono text-lg font-bold text-white">{brl(425)}</p>
              </div>
              <div className="rounded-xl border border-[#2D3239] bg-[#22252A] p-4">
                <p className="text-xs text-[#94A3B8]">Apurado</p>
                <p className="font-mono text-lg font-bold text-[#00E676]">{brl(141.67)}</p>
              </div>
            </div>
            <div className="mt-4 flex h-28 items-end gap-1.5 rounded-xl border border-[#2D3239] bg-[#22252A] p-3">
              {[18, 26, 31, 38, 44, 52, 57, 64, 71, 78, 85, 93].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-[#004D40] to-[#00E676] transition-all duration-300"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs text-[#94A3B8]">
              <TrendingUp className="h-4 w-4 text-[#00E676]" />
              Evolução por dia útil — valores de exemplo para ilustrar a interface.
            </p>
          </Card>
        </div>
      </section>

      {/* COMO FUNCIONA — carrossel */}
      <section id="como-funciona" className="border-b border-[#2D3239] py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold tracking-[0.15em] text-[#00E676] uppercase">Como funciona</span>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Seis etapas, do cadastro ao resgate
          </h2>

          <div className="mt-8 lg:hidden">
            <Card className="border-[#2D3239] bg-[#22252A] p-6" data-testid="carousel-card">
              {(() => {
                const Icon = STEPS[step].icon;
                return (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#004D40]">
                      <Icon className="h-6 w-6 text-[#00E676]" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-white">{STEPS[step].title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#CBD5E1]">{STEPS[step].text}</p>
                  </>
                );
              })()}
            </Card>
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="icon-lg"
                data-testid="carousel-prev"
                aria-label="Etapa anterior"
                className="border-[#2D3239]"
                onClick={() => setStep((s) => (s - 1 + STEPS.length) % STEPS.length)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex gap-2" data-testid="carousel-dots">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 rounded-full transition-all duration-200 ${
                      i === step ? "w-6 bg-[#00E676]" : "w-2 bg-[#2D3239]"
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon-lg"
                data-testid="carousel-next"
                aria-label="Próxima etapa"
                className="border-[#2D3239]"
                onClick={() => setStep((s) => (s + 1) % STEPS.length)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="mt-8 hidden gap-5 lg:grid lg:grid-cols-3">
            {STEPS.map((item) => (
              <Card
                key={item.title}
                data-testid={`step-card-${item.title.charAt(0)}`}
                className="border-[#2D3239] bg-[#22252A] p-6 transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#004D40]">
                  <item.icon className="h-6 w-6 text-[#00E676]" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#CBD5E1]">{item.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* MODALIDADES */}
      <section className="border-b border-[#2D3239] bg-[#141618] py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold tracking-[0.15em] text-[#00E676] uppercase">Modalidades</span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Prazos em dias úteis e projeção do período
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {[mod15, mod30].map(
              (m, i) =>
                m && (
                  <Card
                    key={m.id}
                    data-testid={`modality-card-${m.id}`}
                    className={`p-6 sm:p-7 ${
                      i === 0
                        ? "border-[#2D3239] bg-[#22252A]"
                        : "border-[#00E676]/50 bg-[#004D40]/40 shadow-[0_0_28px_rgba(0,230,118,0.12)]"
                    }`}
                  >
                    <p className="text-sm text-[#94A3B8]">{m.name}</p>
                    <p className="mt-2 font-mono text-4xl font-bold text-[#00E676]">{pct(m.yield_percent)}</p>
                    <p className="mt-3 text-sm leading-relaxed text-[#CBD5E1]">{m.description}</p>
                    <p className="mt-4 text-xs text-[#94A3B8]">
                      Divisão linear: {pct(m.yield_percent / m.business_days)} por dia útil ao longo de{" "}
                      {m.business_days} dias úteis.
                    </p>
                  </Card>
                ),
            )}
            {!mod15 && (
              <Card className="border-[#2D3239] bg-[#22252A] p-6">
                <p className="text-sm text-[#94A3B8]">
                  Modalidades de 15 e 30 dias úteis — carregando informações do servidor.
                </p>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* GRUPOS */}
      <section id="grupos" className="border-b border-[#2D3239] py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold tracking-[0.15em] text-[#00E676] uppercase">Grupos</span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Dez grupos, de R$ 50,00 a R$ 1.000,00
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-[#CBD5E1] sm:text-base">
            Escolha o grupo, selecione a modalidade e siga para o checkout com o link oficial de pagamento.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
            {groups.map((group) => (
              <Link
                key={group.id}
                to="/cadastro"
                data-testid={`landing-group-card-${group.id.toLowerCase()}`}
                className="group rounded-xl border border-[#2D3239] bg-[#22252A] p-4 transition-all duration-200 hover:-translate-y-1 hover:border-[#00E676]/60 hover:shadow-[0_0_20px_rgba(0,230,118,0.15)] sm:p-5"
              >
                <p className="font-heading text-base font-bold text-white sm:text-lg">{group.code}</p>
                <p className="mt-2 font-mono text-lg font-bold text-[#00E676] sm:text-xl">{brl(group.amount)}</p>
                <p className="mt-3 flex items-center gap-1 text-xs text-[#94A3B8] transition-colors duration-200 group-hover:text-[#00E676]">
                  Ver detalhes <ArrowRight className="h-3 w-3" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRANSPARÊNCIA */}
      <section id="transparencia" className="border-b border-[#2D3239] bg-[#141618] py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <span className="text-xs font-semibold tracking-[0.15em] text-[#00E676] uppercase">
              Transparência
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Regras claras e registros auditáveis
            </h2>
            <ul className="mt-6 space-y-4">
              {[
                {
                  icon: BarChart3,
                  title: "Cálculo no servidor",
                  text: "Toda apuração é calculada no backend, no fuso America/Sao_Paulo, com atualização às 00h e sem duplicidade de lançamentos.",
                },
                {
                  icon: Lock,
                  title: "Dados protegidos",
                  text: "Senhas armazenadas com derivação criptográfica (PBKDF2-SHA256), sessões em cookies httpOnly e controle de acesso por função no servidor.",
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
              ].map((item) => (
                <li key={item.title} className="flex gap-4" data-testid={`transparency-item-${item.title.length}`}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#004D40]">
                    <item.icon className="h-5 w-5 text-[#00E676]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#CBD5E1]">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <img
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?crop=entropy&cs=srgb&fm=jpg&q=70&w=1200"
            alt="Reunião institucional"
            className="h-64 w-full rounded-2xl border border-[#2D3239] object-cover sm:h-80 lg:h-96"
          />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b border-[#2D3239] py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <span className="text-xs font-semibold tracking-[0.15em] text-[#00E676] uppercase">
            Perguntas frequentes
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">Tire suas dúvidas</h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((item, index) => (
              <div key={item.q} className="rounded-xl border border-[#2D3239] bg-[#22252A]">
                <button
                  type="button"
                  data-testid={`faq-toggle-${index}`}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-white sm:text-base">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#00E676] transition-transform duration-200 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <p
                    data-testid={`faq-answer-${index}`}
                    className="border-t border-[#2D3239] px-5 py-4 text-sm leading-relaxed text-[#CBD5E1]"
                  >
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-[#004D40] py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Pronto para começar a investir?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#A7F3D0] sm:text-base">
            Crie sua conta, escolha um grupo e acompanhe a apuração diária no seu painel.
          </p>
          <Link
            to="/cadastro"
            data-testid="footer-register-cta"
            className={
              buttonVariants({ size: "lg" }) +
              " mt-7 h-13 bg-[#00E676] px-8 text-base font-semibold text-[#0A1F14] hover:bg-[#00c765] active:scale-[0.98]"
            }
          >
            Criar minha conta
          </Link>
        </div>
      </section>

      <footer className="bg-[#141618] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-md">
              <img src="/logo-fast.png" alt="FAST INVESTIMENTOS" className="h-10 w-auto object-contain" />
              <p className="mt-4 text-xs leading-relaxed text-[#94A3B8]">
                FAST INVESTIMENTOS — plataforma de gestão de grupos de investimento com apuração diária em dias
                úteis. Os percentuais de cada modalidade referem-se à projeção do período contratado e os valores
                apurados são proporcionais aos dias úteis decorridos.
              </p>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-white">Institucional</p>
              <div className="mt-3 flex flex-col gap-2">
                <Link to="/termos" data-testid="footer-terms-link" className="text-[#94A3B8] hover:text-[#00E676]">
                  Termos de uso
                </Link>
                <Link
                  to="/privacidade"
                  data-testid="footer-privacy-link"
                  className="text-[#94A3B8] hover:text-[#00E676]"
                >
                  Política de privacidade (LGPD)
                </Link>
                <Link to="/login" data-testid="footer-login-link" className="text-[#94A3B8] hover:text-[#00E676]">
                  Área do cliente
                </Link>
              </div>
            </div>
          </div>
          <p className="mt-8 border-t border-[#2D3239] pt-6 text-xs text-[#6B7280]">
            © {new Date().getFullYear()} FAST INVESTIMENTOS. Atendimento humano pelo WhatsApp no número oficial
            configurado pela administração.
          </p>
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  );
}
