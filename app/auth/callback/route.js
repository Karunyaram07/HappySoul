// * AUTHENTICATION CALLBACK ROUTE HANDLER
// ! This file runs on the server when a user completes third-party sign-ins (Google OAuth) or confirms email registration.
// ? It exchanges the code parameters from the URL query for an active cookie-based user session.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // * Retrieve post-login route redirection path
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();

    // * Exchange temporary code for secure auth cookies
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // ? Safe for deployment (e.g. Vercel)
      const isLocalEnv = process.env.NODE_ENV === "development";

      // * Route user to final page, honoring deployment subdomains
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // ! Redirect user back to sign-in page with error description if OAuth code swap fails
  return NextResponse.redirect(`${origin}/sign-in?error=Could not authenticate user`);
}

