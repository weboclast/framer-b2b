import { useState } from "react";
import Button from "@/components/Button";
import Field from "@/components/Field";

type ResetPasswordProps = {
    handleSignIn: () => void;
};

const ResetPassword = ({ handleSignIn }: ResetPasswordProps) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setSuccess(true);
            } else {
                const data = await response.json();
                setError(data.error || "Something went wrong");
            }
        } catch {
            setError("Failed to send reset email");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center">
                <div className="mb-6 p-4 bg-green-500/10 text-green-500 rounded-2xl text-body-2">
                    Check your email for a reset link.
                </div>
                <button
                    className="text-t-primary font-bold transition-colors hover:text-primary-01"
                    onClick={handleSignIn}
                >
                    Back to login
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <Field
                className="mt-6"
                innerLabel="Email"
                placeholder="Enter email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            {error && (
                <p className="mt-2 text-red-500 text-body-2">{error}</p>
            )}
            <Button className="mt-6 w-full" isBlack disabled={loading}>
                {loading ? "Sending..." : "Check your inbox"}
            </Button>
            <div className="mt-4 text-center text-body-2 text-t-secondary">
                Have your password?&nbsp;
                <button
                    type="button"
                    className="text-t-primary font-bold transition-colors hover:text-primary-01"
                    onClick={handleSignIn}
                >
                    Login
                </button>
            </div>
        </form>
    );
};

export default ResetPassword;
