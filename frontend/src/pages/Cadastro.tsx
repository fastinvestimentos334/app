import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import BrandLogo from "@/components/BrandLogo";
import WhatsAppButton from "@/components/WhatsAppButton";
import { apiPost } from "@/lib/api";
import { beginSession } from "@/lib/session";
import { apiErrorMessage, maskCep, maskCpf, maskPhone, onlyDigits } from "@/lib/format";
import type { User } from "@/lib/types";

const UF = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

interface ViaCep {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

export default function Cadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    cpf: "",
    email: "",
    phone: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
    password: "",
    confirm: "",
  });
  const [accept, setAccept] = useState(false);
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const lookupCep = async (cep: string) => {
    const digits = onlyDigits(cep);
    if (digits.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = (await res.json()) as ViaCep;
      if (data.erro) return;
      setForm((f) => ({
        ...f,
        address: data.logradouro || f.address,
        district: data.bairro || f.district,
        city: data.localidade || f.city,
        state: (data.uf || f.state).toUpperCase(),
      }));
    } catch {
      /* CEP auto-fill is a convenience only — the user can type the address manually. */
    }
  };

  const mutation = useMutation({
    mutationFn: () =>
      apiPost<User>("/auth/register", {
        full_name: form.full_name,
        cpf: onlyDigits(form.cpf),
        email: form.email,
        phone: onlyDigits(form.phone),
        cep: onlyDigits(form.cep),
        address: form.address,
        number: form.number,
        complement: form.complement,
        district: form.district,
        city: form.city,
        state: form.state,
        password: form.password,
        accept_terms: accept,
      }),
    onSuccess: () => {
      beginSession();
      toast.success("Conta criada com sucesso!");
      navigate("/painel");
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Não foi possível concluir o cadastro.")),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (!accept) {
      toast.error("É necessário aceitar os termos e a política de privacidade.");
      return;
    }
    mutation.mutate();
  };

  const field = (
    key: keyof typeof form,
    label: string,
    props: React.ComponentProps<typeof Input> = {},
    mask?: (v: string) => string,
  ) => (
    <div>
      <Label htmlFor={key} className="text-[#CBD5E1]">
        {label}
      </Label>
      <Input
        id={key}
        data-testid={`register-${key}-input`}
        value={form[key]}
        onChange={(e) => set(key, mask ? mask(e.target.value) : e.target.value)}
        className="mt-2 h-12 border-[#2D3239] bg-[#141618] text-white"
        {...props}
      />
    </div>
  );

  return (
    <div className="min-h-svh bg-[#1C1E21] px-4 py-10 pb-28">
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <BrandLogo className="h-12 sm:h-14" />
        <Card className="mt-7 w-full border-[#2D3239] bg-[#22252A] p-5 sm:p-8">
          <h1 className="text-xl font-bold text-white sm:text-2xl">Criar minha conta</h1>
          <p className="mt-2 text-sm text-[#94A3B8]">
            Preencha seus dados cadastrais. As informações são utilizadas para identificação do titular e
            tratadas conforme a LGPD.
          </p>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            {field("full_name", "Nome completo", { placeholder: "Seu nome completo", autoComplete: "name" })}

            <div>
              {field("cpf", "CPF", { placeholder: "000.000.000-00", inputMode: "numeric" }, maskCpf)}
              <p
                data-testid="register-cpf-explanation"
                className="mt-2 flex gap-2 rounded-lg border border-[#004D40] bg-[#004D40]/25 p-3 text-xs leading-relaxed text-[#A7F3D0]"
              >
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  O CPF é utilizado para a identificação do titular da conta e para a validação da titularidade
                  nos pagamentos e recebimentos via PIX, conforme as regras aplicáveis ao arranjo de pagamento.
                  Não realizamos transferências para chaves PIX de terceiros.
                </span>
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {field("email", "E-mail", { type: "email", placeholder: "seu@email.com", autoComplete: "email" })}
              {field("phone", "Telefone", { placeholder: "(11) 90000-0000", inputMode: "tel" }, maskPhone)}
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
              <div>
                <Label htmlFor="cep" className="text-[#CBD5E1]">
                  CEP
                </Label>
                <Input
                  id="cep"
                  data-testid="register-cep-input"
                  value={form.cep}
                  inputMode="numeric"
                  placeholder="00000-000"
                  onChange={(e) => {
                    const masked = maskCep(e.target.value);
                    set("cep", masked);
                    void lookupCep(masked);
                  }}
                  className="mt-2 h-12 border-[#2D3239] bg-[#141618] text-white"
                />
              </div>
              {field("address", "Endereço", { placeholder: "Rua, avenida..." })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {field("number", "Número", { placeholder: "123", inputMode: "numeric" })}
              {field("complement", "Complemento (opcional)", { placeholder: "Apto, bloco..." })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {field("district", "Bairro", { placeholder: "Centro" })}
              {field("city", "Cidade", { placeholder: "São Paulo" })}
            </div>

            <div>
              <Label htmlFor="state" className="text-[#CBD5E1]">
                Estado (UF)
              </Label>
              <select
                id="state"
                data-testid="register-state-select"
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
                className="mt-2 h-12 w-full rounded-lg border border-[#2D3239] bg-[#141618] px-3 text-white"
              >
                <option value="">Selecione</option>
                {UF.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {field("password", "Senha", {
                type: "password",
                placeholder: "Mínimo 8 caracteres",
                autoComplete: "new-password",
              })}
              {field("confirm", "Confirmar senha", { type: "password", autoComplete: "new-password" })}
            </div>
            <p className="text-xs text-[#94A3B8]">
              A senha deve ter no mínimo 8 caracteres, contendo letras e números.
            </p>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#2D3239] bg-[#141618] p-4">
              <Checkbox
                data-testid="register-terms-checkbox"
                checked={accept}
                onCheckedChange={(checked) => setAccept(checked === true)}
                className="mt-0.5"
              />
              <span className="text-xs leading-relaxed text-[#CBD5E1]">
                Li e aceito os{" "}
                <Link to="/termos" className="text-[#00E676] underline">
                  Termos de uso
                </Link>{" "}
                e a{" "}
                <Link to="/privacidade" className="text-[#00E676] underline">
                  Política de privacidade
                </Link>
                , autorizando o tratamento dos meus dados pessoais para as finalidades descritas.
              </span>
            </label>

            <Button
              type="submit"
              size="lg"
              data-testid="register-submit-button"
              disabled={mutation.isPending}
              className="h-13 w-full bg-[#00E676] text-base font-semibold text-[#0A1F14] hover:bg-[#00c765] active:scale-[0.98]"
            >
              {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Criar minha conta"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-[#94A3B8]">
            Já tem conta?{" "}
            <Link to="/login" data-testid="register-login-link" className="font-semibold text-[#00E676]">
              Entrar
            </Link>
          </p>
        </Card>
      </div>
      <WhatsAppButton />
    </div>
  );
}
