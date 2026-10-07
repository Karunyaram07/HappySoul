// * SUPABASE BROWSER CLIENT
// ! This helper runs exclusively on the browser (Client Components)
// ? It reads credentials from the environment and sets up the listener for user sessions.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
}

