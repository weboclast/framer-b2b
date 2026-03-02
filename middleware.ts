import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  const isOnLoginPage = pathname === "/login";
  const isApiRoute = pathname.startsWith("/api");
  const isAuthApiRoute = pathname.startsWith("/api/auth");
  const isRfqApiRoute = pathname.startsWith("/api/rfq");
  const isProtectedPage = pathname.startsWith("/rfqs") || pathname.startsWith("/settings") || pathname.startsWith("/shipping") || pathname === "/";

  // Allow auth API routes (login, callback, session etc)
  if (isAuthApiRoute) return NextResponse.next();

  // Allow public RFQ submission API
  if (isRfqApiRoute) return NextResponse.next();

  // Redirect to login if accessing protected page while logged out
  if (!isLoggedIn && isProtectedPage && !isOnLoginPage) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Redirect to dashboard if accessing login page while logged in
  if (isLoggedIn && isOnLoginPage) {
    return NextResponse.redirect(new URL("/rfqs", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
