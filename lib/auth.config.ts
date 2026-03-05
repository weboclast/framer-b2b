import type { NextAuthConfig } from "next-auth"

interface ExtendedUser {
    id?: string;
    storeId?: string | null;
    role?: string | null;
}

export default {
    providers: [], // Empty for now, will be merged in auth.ts
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const extendedUser = user as ExtendedUser;
                token.id = extendedUser.id;
                token.storeId = extendedUser.storeId;
                token.role = extendedUser.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.storeId = token.storeId as string | null;
                session.user.role = token.role as string | null;
            }
            return session;
        },
    },
} satisfies NextAuthConfig


