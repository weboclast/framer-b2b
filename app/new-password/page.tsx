"use client";

import NewPassword from "@/components/Login/NewPassword";
import Card from "@/components/Card";
import { Suspense } from "react";

export default function NewPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-b-surface1 p-4">
            <Card className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-h3 mb-2">Reset your password</h1>
                    <p className="text-body-2 text-t-tertiary">
                        Enter your new password below
                    </p>
                </div>
                <Suspense fallback={<div>Loading...</div>}>
                    <NewPassword />
                </Suspense>
            </Card>
        </div>
    );
}
