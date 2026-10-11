import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LineChart, ShieldCheck, Wallet, Clock, Layers } from "lucide-react";
import { brl } from "@/lib/format";

/** Carrossel de apresentação da plataforma: telas reais do produto, sem depoimentos. */

const SLIDES = [
  {
    id: "painel",
    kicker: "Painel do cliente",
    title: "Tudo que importa em uma tela",
    text: "Total investido, resultado apurado e projetado, saldo disponível e o que já foi pago — sem ruído, sem gráficos confusos.",
    icon: Wallet,
  },
  {
    id: "grafico",
    kicker: "Evolução diária",
    title: "Gráfico que atualiza todo dia",
    text: "Dentro de cada investimento, uma curva limpa mostra a apuração acumulada dia útil a dia útil, processada pelo servidor às 00h.",
    icon: LineChart,
  },
  {
    id: "grupos",
    kicker: "Grupos e modalidades",
    title: "Dez grupos, dois prazos",
    text: "De GR 50 a GR 1000, com modalidades de 15 e 30 dias úteis. Você escolhe, confere a projeção e segue para o checkout.",
    icon: Layers,
  },
  {
    id: "resgate",
    kicker: "Resgates auditados",
    title: "Cada liberação é analisada",
    text: "Solicite o resgate, acompanhe o status e veja o parecer da administração. Toda decisão fica registrada em auditoria.",
    icon: ShieldCheck,
  },
];

function SlideVisual({ id }: { id: string }) {
  if (id === "grafico") {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-[#15181B] p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] tracking-[0.1em] text-[#7D8794] uppercase">Total apurado</p>
          <p className="font-mono text-sm font-semibold text-[#00E676]">{brl(141.67)}</p>
        </div>
        <svg viewBox="0 0 320 110" className="mt-4 h-28 w-full" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="slideFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00E676" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00E676" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[22, 51, 80].map((y) => (
            <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          ))}
          <path
            d="M0 96 L32 91 L64 85 L96 76 L128 70 L160 59 L192 52 L224 41 L256 32 L288 21 L320 12 L320 110 L0 110 Z"
            fill="url(#slideFill)"
          />
          <path
            d="M0 96 L32 91 L64 85 L96 76 L128 70 L160 59 L192 52 L224 41 L256 32 L288 21 L320 12"
            fill="none"
            stroke="#00E676"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="320" cy="12" r="3.5" fill="#00E676" />
        </svg>
        <div className="mt-2 flex justify-between font-mono text-[10px] text-[#6B7480]">
          <span>D1</span>
          <span>D8</span>
          <span>D15</span>
        </div>
      </div>
    );
  }

  if (id === "grupos") {
    return (
      <div className="grid grid-cols-3 gap-2.5">
        {[50, 100, 200, 250, 500, 1000].map((v, i) => (
          <div
            key={v}
            className={`rounded-lg border p-3 ${
              i === 4
                ? "border-[#00E676]/40 bg-[#00E676]/[0.08]"
                : "border-white/[0.08] bg-[#15181B]"
            }`}
          >
            <p className="text-[10px] tracking-[0.08em] text-[#7D8794] uppercase">GR {v}</p>
            <p className="mt-1.5 font-mono text-sm font-semibold text-white">{brl(v)}</p>
          </div>
        ))}
      </div>
    );
  }

  if (id === "resgate") {
    return (
      <div className="space-y-2.5">
        {[
          { label: "Solicitação registrada", state: "Concluído", tone: "text-[#00E676]" },
          { label: "Análise da administração", state: "Em curso", tone: "text-[#FFD740]" },
          { label: "Registro em auditoria", state: "Automático", tone: "text-[#8A94A0]" },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#15181B] px-4 py-3"
          >
            <span className="text-xs text-[#C0C8D1]">{row.label}</span>
            <span className={`font-mono text-[11px] ${row.tone}`}>{row.state}</span>
          </div>
        ))}
      </div>
    );
  }

  // painel
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-white/[0.08] bg-[#15181B] p-4">
        <p className="text-[11px] tracking-[0.1em] text-[#7D8794] uppercase">Total investido</p>
        <p className="mt-1.5 font-mono text-2xl font-semibold text-white">{brl(1500)}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[#00E676]/20 bg-[#00E676]/[0.07] p-4">
          <p className="text-[11px] text-[#8FD9BE]">Apurado</p>
          <p className="mt-1.5 font-mono text-base font-semibold text-[#00E676]">{brl(141.67)}</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-[#15181B] p-4">
          <p className="text-[11px] text-[#7D8794]">Projetado</p>
          <p className="mt-1.5 font-mono text-base font-semibold text-white">{brl(425)}</p>
        </div>
      </div>
    </div>
  );
}

export default function PlatformCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, [paused]);

  const slide = SLIDES[index];
  const Icon = slide.icon;

  return (
    <div
      className="overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-gradient-to-br from-[#24272C] to-[#191C20] shadow-[0_34px_80px_-44px_rgba(0,0,0,1)]"
      data-testid="platform-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div key={slide.id} className="animate-fade-up">
          <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-[#00E676] uppercase">
            <Icon className="h-4 w-4" strokeWidth={1.8} />
            {slide.kicker}
          </p>
          <h3
            className="mt-4 text-xl font-semibold text-white sm:text-[1.75rem]"
            data-testid="carousel-slide-title"
          >
            {slide.title}
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-[#A8B0BA]">{slide.text}</p>

          <div className="mt-8 flex items-center gap-4">
            <button
              type="button"
              aria-label="Apresentação anterior"
              data-testid="platform-carousel-prev"
              onClick={() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.03] text-white transition-colors duration-200 hover:border-[#00E676]/50 hover:text-[#00E676]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Próxima apresentação"
              data-testid="platform-carousel-next"
              onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.03] text-white transition-colors duration-200 hover:border-[#00E676]/50 hover:text-[#00E676]"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="ml-2 flex items-center gap-2" data-testid="platform-carousel-dots">
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Ir para ${s.kicker}`}
                  data-testid={`platform-carousel-dot-${i}`}
                  onClick={() => setIndex(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === index ? "w-8 bg-[#00E676]" : "w-4 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="mt-6 flex items-center gap-2 text-[11px] text-[#6B7480]">
            <Clock className="h-3.5 w-3.5" />
            Apuração processada diariamente às 00h (America/Sao_Paulo)
          </p>
        </div>

        <div key={`${slide.id}-visual`} className="animate-rise" data-testid="carousel-slide-visual">
          <SlideVisual id={slide.id} />
        </div>
      </div>
    </div>
  );
}
