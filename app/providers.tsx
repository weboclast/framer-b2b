"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <SessionProvider>
            <ThemeProvider disableTransitionOnChange>{children}</ThemeProvider>
        </SessionProvider>
    );
};

export default Providers;
