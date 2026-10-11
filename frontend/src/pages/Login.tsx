import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BrandLogo from "@/components/BrandLogo";
import WhatsAppButton from "@/components/WhatsAppButton";
import { apiPost } from "@/lib/api";
import { beginSession } from "@/lib/session";
import { apiErrorMessage } from "@/lib/format";
import type { User } from "@/lib/types";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => apiPost<User>("/auth/login", { email, password }),
    onSuccess: (user) => {
      beginSession();
      toast.success(`Bem-vindo, ${user.full_name.split(" ")[0]}!`);
      navigate(user.role === "admin" ? "/admin" : "/painel");
    },
    onError: (error) => toast.error(apiErrorMessage(error, "E-mail ou senha inválidos.")),
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#1C1E21] px-4 py-10 pb-28">
      <BrandLogo className="h-12 sm:h-14" />
      <Card className="mt-7 w-full max-w-md border-[#2D3239] bg-[#22252A] p-6 sm:p-8">
        <h1 className="text-xl font-bold text-white sm:text-2xl">Entrar na sua conta</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">Acesse seu painel para acompanhar seus investimentos.</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email || !password) {
              toast.error("Informe e-mail e senha.");
              return;
            }
            mutation.mutate();
          }}
        >
          <div>
            <Label htmlFor="email" className="text-[#CBD5E1]">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              data-testid="login-email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="mt-2 h-12 border-[#2D3239] bg-[#141618] text-white"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-[#CBD5E1]">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              data-testid="login-password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 h-12 border-[#2D3239] bg-[#141618] text-white"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            data-testid="login-submit-button"
            disabled={mutation.isPending}
            className="h-13 w-full bg-[#00E676] text-base font-semibold text-[#0A1F14] hover:bg-[#00c765] active:scale-[0.98]"
          >
            {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-sm">
          <Link
            to="/recuperar-senha"
            data-testid="login-forgot-link"
            className="text-[#00E676] hover:underline"
          >
            Esqueci minha senha
          </Link>
          <p className="text-[#94A3B8]">
            Ainda não tem conta?{" "}
            <Link to="/cadastro" data-testid="login-register-link" className="font-semibold text-[#00E676]">
              Criar minha conta
            </Link>
          </p>
          <Link to="/" data-testid="login-home-link" className="text-[#6B7280] hover:text-[#94A3B8]">
            Voltar para a página inicial
          </Link>
        </div>
      </Card>
      <WhatsAppButton />
    </div>
  );
}
