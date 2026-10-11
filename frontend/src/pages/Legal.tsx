import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Card } from "@/components/ui/card";

const CONTENT = {
  termos: {
    title: "Termos de uso",
    sections: [
      {
        h: "1. Objeto",
        p: "Estes termos regulam o uso da plataforma FAST INVESTIMENTOS para contratação e acompanhamento de grupos de investimento, com modalidades de prazo definidas em dias úteis.",
      },
      {
        h: "2. Cadastro e titularidade",
        p: "O usuário declara que os dados informados são verdadeiros e que é o titular do CPF cadastrado. O CPF é utilizado para identificação e para a validação da titularidade nas operações de pagamento e recebimento via PIX. Não são realizadas operações para chaves PIX de terceiros.",
      },
      {
        h: "3. Grupos e modalidades",
        p: "Cada grupo possui valor de entrada fixo (de R$ 50,00 a R$ 1.000,00). As modalidades disponíveis são de 15 dias úteis, com projeção de 15% no período, e 30 dias úteis, com projeção de 35% no período. O percentual refere-se ao período integral contratado e a apuração é proporcional aos dias úteis decorridos.",
      },
      {
        h: "4. Apuração e cálculo",
        p: "Todo o cálculo é realizado no servidor, no fuso horário America/Sao_Paulo, com atualização às 00h e observância do calendário de dias úteis. A plataforma diferencia valores projetados, apurados, pagos e disponíveis, e adota controles para evitar duplicidade de lançamentos.",
      },
      {
        h: "5. Pagamentos",
        p: "Os pagamentos de aportes são realizados exclusivamente pelo link oficial determinado pela administração, apresentado no checkout. A ativação do investimento ocorre após a confirmação do pagamento pela administração.",
      },
      {
        h: "6. Resgates",
        p: "As solicitações de resgate são analisadas manualmente pela administração, com justificativa e registro de auditoria. A aprovação administrativa não se confunde com a confirmação do pagamento, que é registrada em etapa própria.",
      },
      {
        h: "7. Atendimento",
        p: "O atendimento humano é prestado pelo número oficial de WhatsApp divulgado na plataforma e configurado pela administração.",
      },
    ],
  },
  privacidade: {
    title: "Política de privacidade (LGPD)",
    sections: [
      {
        h: "1. Controlador e finalidade",
        p: "A FAST INVESTIMENTOS trata os dados pessoais coletados para identificação do titular, execução das operações contratadas, cumprimento de obrigações legais e regulatórias e prevenção a fraudes.",
      },
      {
        h: "2. Dados coletados",
        p: "Nome completo, CPF, e-mail, telefone, endereço completo (CEP, logradouro, número, complemento, bairro, cidade e estado), registros de acesso e dados das operações realizadas na plataforma.",
      },
      {
        h: "3. Base legal",
        p: "O tratamento fundamenta-se na execução de contrato, no cumprimento de obrigação legal ou regulatória, no legítimo interesse para prevenção a fraudes e, quando aplicável, no consentimento do titular manifestado no cadastro.",
      },
      {
        h: "4. Segurança",
        p: "As senhas são armazenadas com derivação criptográfica (PBKDF2-SHA256) e nunca em texto claro. As sessões utilizam cookies httpOnly, o controle de acesso por função é validado no servidor e todas as ações sensíveis geram registro de auditoria.",
      },
      {
        h: "5. Compartilhamento",
        p: "Os dados não são comercializados. O compartilhamento ocorre apenas com prestadores necessários à operação e com autoridades competentes, quando exigido por lei.",
      },
      {
        h: "6. Direitos do titular",
        p: "O titular pode solicitar confirmação de tratamento, acesso, correção, portabilidade, anonimização, eliminação e informações sobre compartilhamento, pelo canal oficial de atendimento. Pedidos de exclusão são processados pela administração com registro de auditoria.",
      },
      {
        h: "7. Retenção",
        p: "Os dados são mantidos pelo período necessário às finalidades informadas e aos prazos legais de guarda aplicáveis às operações financeiras.",
      },
    ],
  },
} as const;

export default function Legal({ kind }: { kind: "termos" | "privacidade" }) {
  const content = CONTENT[kind];
  return (
    <div className="min-h-svh bg-[#1C1E21] px-4 py-10 pb-28 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <BrandLogo className="h-10 sm:h-12" />
        <h1
          className="mt-7 text-2xl font-bold tracking-tight text-white sm:text-3xl"
          data-testid={`legal-title-${kind}`}
        >
          {content.title}
        </h1>
        <Card className="mt-6 border-white/[0.08] bg-gradient-to-br from-[#24272C] to-[#1B1E22] shadow-[0_28px_70px_-36px_rgba(0,0,0,1)] p-5 sm:p-8">
          <div className="space-y-6">
            {content.sections.map((section) => (
              <section key={section.h}>
                <h2 className="text-base font-semibold text-white">{section.h}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#C0C8D1]">{section.p}</p>
              </section>
            ))}
          </div>
        </Card>
        <Link to="/" data-testid="legal-home-link" className="mt-6 block text-sm text-[#00E676] hover:underline">
          ← Voltar para a página inicial
        </Link>
      </div>
      <WhatsAppButton />
    </div>
  );
}
