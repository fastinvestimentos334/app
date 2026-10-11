import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";
import { useMe } from "@/hooks/useAppData";

const LINKS = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#grupos", label: "Grupos" },
  { href: "#transparencia", label: "Transparência" },
  { href: "#faq", label: "Perguntas frequentes" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { data: me } = useMe();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-[#2D3239] bg-[#1C1E21]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <BrandLogo />

        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              data-testid={`nav-link-${link.href.replace("#", "")}`}
              className="text-sm font-medium text-[#CBD5E1] transition-colors duration-200 hover:text-[#00E676]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {me ? (
            <Button
              data-testid="header-dashboard-button"
              onClick={() => navigate(me.role === "admin" ? "/admin" : "/painel")}
              className="bg-[#00E676] font-semibold text-[#0A1F14] hover:bg-[#00c765]"
            >
              {me.role === "admin" ? "Painel administrativo" : "Meu painel"}
            </Button>
          ) : (
            <>
              <Link
                to="/login"
                data-testid="header-login-link"
                className={buttonVariants({ variant: "outline" }) + " border-[#2D3239] text-white"}
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                data-testid="header-register-link"
                className={buttonVariants() + " bg-[#00E676] font-semibold text-[#0A1F14] hover:bg-[#00c765]"}
              >
                Criar minha conta
              </Link>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Abrir menu"
          data-testid="mobile-menu-toggle"
          className="lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {open && (
        <div className="border-t border-[#2D3239] bg-[#141618] px-4 pt-3 pb-5 lg:hidden" data-testid="mobile-menu">
          <nav className="flex flex-col">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                data-testid={`mobile-nav-link-${link.href.replace("#", "")}`}
                className="border-b border-[#2D3239] py-3.5 text-base text-[#CBD5E1] transition-colors duration-200 hover:text-[#00E676]"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            {me ? (
              <Link
                to={me.role === "admin" ? "/admin" : "/painel"}
                data-testid="mobile-dashboard-link"
                className={buttonVariants({ size: "lg" }) + " bg-[#00E676] font-semibold text-[#0A1F14]"}
              >
                {me.role === "admin" ? "Painel administrativo" : "Meu painel"}
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  data-testid="mobile-login-link"
                  className={buttonVariants({ variant: "outline", size: "lg" }) + " border-[#2D3239] text-white"}
                >
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  data-testid="mobile-register-link"
                  className={buttonVariants({ size: "lg" }) + " bg-[#00E676] font-semibold text-[#0A1F14]"}
                >
                  Criar minha conta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
