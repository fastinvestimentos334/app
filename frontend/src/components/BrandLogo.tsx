import { Link } from "react-router-dom";

export default function BrandLogo({
  className = "h-9 sm:h-11",
  to = "/",
  testid = "brand-logo-link",
}: {
  className?: string;
  to?: string;
  testid?: string;
}) {
  return (
    <Link to={to} data-testid={testid} className="flex shrink-0 items-center">
      <img
        src="/logo-fast.png"
        alt="FAST INVESTIMENTOS"
        className={`${className} w-auto object-contain mix-blend-lighten`}
      />
    </Link>
  );
}
