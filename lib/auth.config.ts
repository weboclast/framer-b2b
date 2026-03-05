import type { NextAuthConfig } from "next-auth"

export default {
    providers: [], // Empty for now, will be merged in auth.ts
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.storeId = (user as any).storeId;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id as string;
                (session.user as any).storeId = token.storeId as string | null;
                (session.user as any).role = token.role as string | null;
            }
            return session;
        },
    },
} satisfies NextAuthConfig

