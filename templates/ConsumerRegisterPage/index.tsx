"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Field from "@/components/Field";
import Button from "@/components/Button";

const ConsumerRegisterPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/consumer/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Registration failed");
            }
            router.push("/consumer/login?registered=true");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
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
                <h1 className="text-h4 mb-2">Create Buyer Account</h1>
                <p className="text-body-2 text-t-tertiary mb-8">
                    Join RFQ Hub to track your quote requests across all vendors.
                </p>

                {error && (
                    <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-body-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <Field
                        label="Full Name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
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
                        placeholder="Min. 8 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    <Button type="submit" isBlack className="w-full py-4 mt-2" disabled={isLoading}>
                        {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                </form>

                <p className="text-body-2 text-t-tertiary text-center mt-10">
                    Already have an account?{" "}
                    <Link href="/consumer/login" className="text-t-primary font-medium hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ConsumerRegisterPage;
