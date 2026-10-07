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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Guard against missing environment variables on initial deployment
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  try {
    // * Initialize server client specific to middleware context
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
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

    // Helper to ensure cookies set/refreshed by Supabase are preserved across redirects
    const redirectWithCookies = (destinationUrl) => {
      const redirectResponse = NextResponse.redirect(destinationUrl);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    };

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
        return redirectWithCookies(new URL("/onboarding", request.url));
      }

      // * Dashboard Redirects: Send onboarded users trying to access login or onboarding to dashboard
      if (isOnboarded && (url.pathname.startsWith("/onboarding") || url.pathname === "/sign-in" || url.pathname === "/sign-up")) {
        return redirectWithCookies(new URL("/dashboard", request.url));
      }
    } else {
      // * Protected Route Checks for guests trying to access dashboard or onboarding
      if (url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/onboarding")) {
        const signInUrl = new URL("/sign-in", request.url);
        signInUrl.searchParams.set("next", url.pathname); // ? Pass post-auth redirection path
        return redirectWithCookies(signInUrl);
      }
    }
  } catch (err) {
    console.error("Middleware session error:", err);
    return supabaseResponse;
  }

  return supabaseResponse;
}
