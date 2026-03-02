import type { NextAuthConfig } from "next-auth"

export default {
    providers: [], // Empty for now, will be merged in auth.ts
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;
            const isProtectedPage = pathname.startsWith("/rfqs") || pathname.startsWith("/settings") || pathname.startsWith("/shipping") || pathname === "/";
            const isOnLoginPage = pathname === "/login";

            if (isProtectedPage) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            } else if (isOnLoginPage) {
                if (isLoggedIn) {
                    return Response.redirect(new URL("/rfqs", nextUrl));
                }
                return true;
            }
            return true;
        },
    },
} satisfies NextAuthConfig
