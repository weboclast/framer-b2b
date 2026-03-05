"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Field from "@/components/Field";
import Button from "@/components/Button";

const ConsumerLoginPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (searchParams.get("registered")) {
            setSuccess("Account created successfully! Please log in.");
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch("/api/consumer/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Login failed");
            }
            router.push("/consumer/rfqs");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-b-surface1 p-6">
            <div className="w-full max-w-[440px] bg-white p-10 rounded-[32px] shadow-sm border border-s-stroke2 max-md:p-8">
                <Link href="/" className="inline-block mb-10">
                    <Image src="/logo.svg" width={116} height={32} alt="RFQ Hub" />
                </Link>
                <h1 className="text-h4 mb-2">Buyer Login</h1>
                <p className="text-body-2 text-t-tertiary mb-8">
                    Manage your quote requests in one place.
                </p>

                {success && (
                    <div className="p-4 mb-6 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-body-2">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-body-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <Field
                        label="Email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <Field
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    <Button type="submit" isBlack className="w-full py-4 mt-2" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Log In"}
                    </Button>
                </form>

                <p className="text-body-2 text-t-tertiary text-center mt-10">
                    Don't have a buyer account?{" "}
                    <Link href="/consumer/register" className="text-t-primary font-medium hover:underline">
                        Create account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ConsumerLoginPage;
