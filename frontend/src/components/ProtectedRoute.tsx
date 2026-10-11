import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useMe } from "@/hooks/useAppData";

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { data: me, isLoading, isError } = useMe();

  if (isLoading) {
    return (
      <div
        className="flex min-h-svh items-center justify-center bg-[#1C1E21]"
        data-testid="protected-route-loading"
      >
        <Loader2 className="h-8 w-8 animate-spin text-[#00E676]" />
      </div>
    );
  }

  if (isError || !me) return <Navigate to="/login" replace />;
  if (requireAdmin && me.role !== "admin") return <Navigate to="/painel" replace />;

  return <>{children}</>;
}
