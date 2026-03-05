import NextAuth from "next-auth";
import authConfig from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const pathname = nextUrl.pathname;

  const isOnLoginPage = pathname === "/login";
  const isAuthApiRoute = pathname.startsWith("/api/auth");
  const isPublicApiRoute = pathname.startsWith("/api/rfq") || pathname.startsWith("/api/discounts/validate");
  const isConsumerRoute = pathname.startsWith("/consumer");
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isVendorRoute = pathname.startsWith("/rfqs") || pathname.startsWith("/settings") || pathname.startsWith("/shipping") || pathname.startsWith("/customers") || pathname.startsWith("/discounts") || pathname === "/";

  // 1. Allow Auth API routes
  if (isAuthApiRoute) return NextResponse.next();

  // 2. Allow Public API routes
  if (isPublicApiRoute) return NextResponse.next();

  // 3. Handle Admin Protection
  if (isAdminRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    if (userRole !== "SUPER_ADMIN") return NextResponse.redirect(new URL("/rfqs", nextUrl));
    return NextResponse.next();
  }

  // 4. Handle Vendor/Dashboard Protection
  if (isVendorRoute) {
    if (!isLoggedIn && !isOnLoginPage) return NextResponse.redirect(new URL("/login", nextUrl));

    if (isLoggedIn && (isOnLoginPage || pathname === "/")) {
      if (userRole === "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/admin/stores", nextUrl));
      }
      return NextResponse.redirect(new URL("/rfqs", nextUrl));
    }
    return NextResponse.next();
  }


  // 5. Handle Consumer Protection (Minimal)
  // Consumer pages like /consumer/rfqs need 'consumer-token' cookie. 
  // API routes are handled by token validation in their handlers anyway.
  if (isConsumerRoute) {
    const isConsumerAuthPage = pathname === "/consumer/login" || pathname === "/consumer/register";
    const hasConsumerToken = req.cookies.has("consumer-token");

    if (!isConsumerAuthPage && !hasConsumerToken) {
      return NextResponse.redirect(new URL("/consumer/login", nextUrl));
    }
    if (isConsumerAuthPage && hasConsumerToken) {
      return NextResponse.redirect(new URL("/consumer/rfqs", nextUrl));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

