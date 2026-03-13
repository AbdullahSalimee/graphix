/**
 * Next.js Edge Middleware — Server-side route protection
 *
 * Runs before the page renders. Checks for a token in cookies.
 * If the user tries to access /dashboard or /app without being logged in,
 * they are immediately redirected to /signin — even if they type it in the URL bar.
 *
 * Note: The client-side RouteGuard is also kept as a second layer of defense,
 * but this middleware is the primary, fast guard.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/app"];

// Routes that should NOT be accessible when already logged in
const AUTH_ROUTES = ["/signin", "/signup", "/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read the token from localStorage is NOT possible in middleware (server-side).
  // Instead we use a cookie that we set on login.
  const token = request.cookies.get("graphix_token")?.value;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // ── Redirect unauthenticated users away from protected routes ──
  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("redirect", pathname); // remember where they were going
    return NextResponse.redirect(url);
  }

  // ── Redirect authenticated users away from auth pages ──────────
  if (isAuthRoute && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/app/:path*",
    "/signin",
    "/signup",
    "/login",
  ],
};
