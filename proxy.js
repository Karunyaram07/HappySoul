// * NEXT.JS 16 ROUTING GUARD PROXY (REPLACES DEPRECATED MIDDLEWARE)
// ! This file runs on the Edge runtime and intercepts routing requests.
// ? It triggers the session refresh check and matches specific routes for filtering.

import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request) {
  // * Process session updates and route guards via Supabase middleware client
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * * Matcher Rules:
     * ? Matches all routes EXCEPT:
     * - _next/static (Webpack/Turbopack built assets)
     * - _next/image (Next.js image resizing optimizer)
     * - favicon.ico (Site icon)
     * - files with static extensions (.svg, .png, .jpg, .webp, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

