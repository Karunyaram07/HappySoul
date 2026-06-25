import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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

  // Get current user, which also refreshes the session token automatically
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = new URL(request.url);

  // Protected route check
  if (!user && url.pathname.startsWith("/dashboard")) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("next", url.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect authenticated users trying to access login/register back to dashboard
  if (user && (url.pathname === "/sign-in" || url.pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}
