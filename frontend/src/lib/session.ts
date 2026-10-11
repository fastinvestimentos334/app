import { queryClient } from "@/lib/queryClient";
import { apiPost } from "@/lib/api";
import type { MessageOut } from "@/lib/types";

/** Call after a successful login/signup so no cache from a previous account survives. */
export function beginSession() {
  queryClient.clear();
}

/** The only sign-out path: clears the server cookie AND the local react-query cache. */
export async function endSession() {
  try {
    await apiPost<MessageOut>("/auth/logout");
  } finally {
    queryClient.clear();
  }
}
