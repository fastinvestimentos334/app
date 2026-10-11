import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { Catalog, User } from "@/lib/types";

export const useCatalog = () =>
  useQuery({
    queryKey: ["catalog"],
    queryFn: () => apiGet<Catalog>("/catalog"),
    retry: false,
    staleTime: 60_000,
  });

export const useMe = () =>
  useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<User>("/auth/me"),
    retry: false,
  });
