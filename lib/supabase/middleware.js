// * SUPABASE MIDDLEWARE / ROUTE PROTECTION
// ! This function runs on every matched route request to refresh sessions and enforce access rules.
// ? It acts as the gatekeeper for authenticated page security.

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function updateSession(request) {
  // * Create standard intermediate response that forwards headers
  let supabaseResponse = NextResponse.next({
    request,
  });

  // * Initialize server client specific to middleware context
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // * getUser() fetches user object and refreshes the JWT token automatically if expired
  // ! Do NOT use getSession() here as it is easily spoofed from the client
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = new URL(request.url);

  // * Bypass redirects for auth callback route to ensure code exchanges complete successfully
  if (url.pathname.startsWith("/auth/callback")) {
    return supabaseResponse;
  }

  if (user) {
    // * Query user profile onboarding status
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_onboarded")
      .eq("id", user.id)
      .single();

    const isOnboarded = profile?.is_onboarded || false;

    // * Check Onboarding Status: Redirect authenticated users to onboarding if incomplete
    if (!isOnboarded && !url.pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // * Dashboard Redirects: Send onboarded users trying to access login, lander, or onboarding to dashboard
    if (isOnboarded && (url.pathname === "/" || url.pathname.startsWith("/onboarding") || url.pathname === "/sign-in" || url.pathname === "/sign-up")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } else {
    // * Protected Route Checks for guests trying to access dashboard or onboarding
    if (url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/onboarding")) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("next", url.pathname); // ? Pass post-auth redirection path
      return NextResponse.redirect(signInUrl);
    }
  }

  return supabaseResponse;
}
