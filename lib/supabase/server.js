// * SUPABASE SERVER CLIENT
// ! This helper runs exclusively on the server (Server Components, Route Handlers, and Server Actions)
// ? It handles reading and writing session cookies securely.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  // * Retrieve cookie store asynchronously (Next.js App Router standard)
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ! The `setAll` method was called from a Server Component.
            // ? This is normal and can be safely ignored because middleware (proxy) handles refreshing session tokens.
          }
        },
      },
    }
  );
}

