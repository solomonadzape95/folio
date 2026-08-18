import { createClient } from "./supabase/server";

export type AuthUser = { id: string; email: string };

export async function currentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const id = claims?.sub;
  const email = claims?.email;
  if (error || typeof id !== "string") return null;
  return {
    id,
    email: typeof email === "string" ? email : "",
  };
}
