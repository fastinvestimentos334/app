import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Cadastro from "@/pages/Cadastro";
import RecuperarSenha from "@/pages/RecuperarSenha";
import Painel from "@/pages/Painel";
import Grupos from "@/pages/Grupos";
import Checkout from "@/pages/Checkout";
import InvestimentoDetalhe from "@/pages/InvestimentoDetalhe";
import Saques from "@/pages/Saques";
import Historico from "@/pages/Historico";
import Admin from "@/pages/Admin";
import Legal from "@/pages/Legal";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/termos" element={<Legal kind="termos" />} />
        <Route path="/privacidade" element={<Legal kind="privacidade" />} />
        <Route
          path="/painel"
          element={
            <ProtectedRoute>
              <Painel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/grupos"
          element={
            <ProtectedRoute>
              <Grupos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/:id"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/investimento/:id"
          element={
            <ProtectedRoute>
              <InvestimentoDetalhe />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saques"
          element={
            <ProtectedRoute>
              <Saques />
            </ProtectedRoute>
          }
        />
        <Route
          path="/historico"
          element={
            <ProtectedRoute>
              <Historico />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Landing />} />
      </Routes>
      <Toaster richColors />
    </>
  );
}
