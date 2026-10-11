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
import { apiErrorMessage } from "@/lib/format";
import type { ForgotPasswordOut, MessageOut } from "@/lib/types";

export default function RecuperarSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [stage, setStage] = useState<"request" | "reset">("request");

  const request = useMutation({
    mutationFn: () => apiPost<ForgotPasswordOut>("/auth/forgot-password", { email }),
    onSuccess: (data) => {
      toast.success(data.message);
      if (data.reset_token) setToken(data.reset_token);
      setStage("reset");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const reset = useMutation({
    mutationFn: () => apiPost<MessageOut>("/auth/reset-password", { token, password }),
    onSuccess: (data) => {
      toast.success(data.message);
      navigate("/login");
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Código inválido ou expirado.")),
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#1C1E21] px-4 py-10 pb-28">
      <BrandLogo className="h-12 sm:h-14" />
      <Card className="mt-7 w-full max-w-md border-[#2D3239] bg-[#22252A] p-6 sm:p-8">
        <h1 className="text-xl font-bold text-white sm:text-2xl">Recuperar senha</h1>

        {stage === "request" ? (
          <>
            <p className="mt-2 text-sm text-[#94A3B8]">
              Informe o e-mail cadastrado para gerar um código de redefinição válido por 30 minutos.
            </p>
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                request.mutate();
              }}
            >
              <div>
                <Label htmlFor="recover-email" className="text-[#CBD5E1]">
                  E-mail
                </Label>
                <Input
                  id="recover-email"
                  type="email"
                  data-testid="forgot-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="mt-2 h-12 border-[#2D3239] bg-[#141618] text-white"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                data-testid="forgot-submit-button"
                disabled={request.isPending}
                className="h-13 w-full bg-[#00E676] text-base font-semibold text-[#0A1F14] hover:bg-[#00c765]"
              >
                {request.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Gerar código"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-[#94A3B8]">
              Informe o código de redefinição e a nova senha.
            </p>
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                reset.mutate();
              }}
            >
              <div>
                <Label htmlFor="reset-token" className="text-[#CBD5E1]">
                  Código de redefinição
                </Label>
                <Input
                  id="reset-token"
                  data-testid="reset-token-input"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="mt-2 h-12 border-[#2D3239] bg-[#141618] font-mono text-xs text-white"
                />
              </div>
              <div>
                <Label htmlFor="reset-password" className="text-[#CBD5E1]">
                  Nova senha
                </Label>
                <Input
                  id="reset-password"
                  type="password"
                  data-testid="reset-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres, com letras e números"
                  className="mt-2 h-12 border-[#2D3239] bg-[#141618] text-white"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                data-testid="reset-submit-button"
                disabled={reset.isPending}
                className="h-13 w-full bg-[#00E676] text-base font-semibold text-[#0A1F14] hover:bg-[#00c765]"
              >
                {reset.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Redefinir senha"}
              </Button>
            </form>
          </>
        )}

        <Link to="/login" data-testid="recover-login-link" className="mt-6 block text-sm text-[#00E676]">
          Voltar para o login
        </Link>
      </Card>
      <WhatsAppButton />
    </div>
  );
}
