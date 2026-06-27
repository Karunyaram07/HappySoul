// * SUPABASE BROWSER CLIENT
// ! This helper runs exclusively on the browser (Client Components)
// ? It reads credentials from the environment and sets up the listener for user sessions.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

