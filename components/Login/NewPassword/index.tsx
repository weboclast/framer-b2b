import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import Field from "@/components/Field";

const NewPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (!token) {
            setError("Invalid or missing token");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/new-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password, token }),
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            } else {
                const data = await response.json();
                setError(data.error || "Something went wrong");
            }
        } catch {
            setError("Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center">
                <div className="mb-6 p-4 bg-green-500/10 text-green-500 rounded-2xl text-body-2">
                    Password reset successful! Redirecting to login...
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <Field
                className="mt-6"
                innerLabel="New Password"
                placeholder="Enter new password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <Field
                className="mt-6"
                innerLabel="Confirm Password"
                placeholder="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />
            {error && <p className="mt-2 text-red-500 text-body-2">{error}</p>}
            <Button className="mt-6 w-full" isBlack disabled={loading}>
                {loading ? "Resetting..." : "Reset password"}
            </Button>
        </form>
    );
};

export default NewPassword;
