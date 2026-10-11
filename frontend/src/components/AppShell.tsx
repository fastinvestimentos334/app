import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Layers, Wallet, History, LogOut, ShieldCheck } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { endSession } from "@/lib/session";
import { useMe } from "@/hooks/useAppData";

const NAV = [
  { to: "/painel", label: "Painel", icon: LayoutDashboard, testid: "app-nav-painel" },
  { to: "/grupos", label: "Grupos", icon: Layers, testid: "app-nav-grupos" },
  { to: "/saques", label: "Saques", icon: Wallet, testid: "app-nav-saques" },
  { to: "/historico", label: "Histórico", icon: History, testid: "app-nav-historico" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: me } = useMe();

  const logout = async () => {
    await endSession();
    navigate("/login");
  };

  return (
    <div className="min-h-svh bg-[#1C1E21]">
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#1C1E21]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <BrandLogo to="/painel" className="h-8 sm:h-10" testid="app-brand-logo" />
          <div className="flex items-center gap-2">
            {me?.role === "admin" && (
              <Link
                to="/admin"
                data-testid="app-nav-admin"
                className="hidden items-center gap-2 rounded-lg border border-[#00E676]/25 px-3 py-2 text-sm font-medium text-[#A7F3D0] transition-colors duration-200 hover:bg-[#00E676]/12 sm:flex"
              >
                <ShieldCheck className="h-4 w-4" /> Admin
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              data-testid="logout-button"
              onClick={logout}
              className="text-[#A0AEC0] hover:text-white"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 pb-2 sm:px-6">
          {NAV.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                data-testid={item.testid}
                className={`flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3.5 text-sm font-medium transition-colors duration-200 ${
                  active ? "bg-[#00E676]/12 text-[#00E676]" : "text-[#A0AEC0] hover:bg-[#25282E] hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-28 sm:px-6">{children}</main>
    </div>
  );
}
