import { useState } from "react";
import { signIn } from "next-auth/react";
import Button from "@/components/Button";
import Field from "@/components/Field";

type SignInProps = {
    handleSignUp: () => void;
    handleForgotPassword: () => void;
};

const SignIn = ({ handleSignUp, handleForgotPassword }: SignInProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        console.log("Attempting sign in with", email);
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });
        console.log("Sign in result:", result);

        if (result?.error) {
            console.error("Sign in error:", result.error);
            setError("Invalid email or password");
            setLoading(false);
        } else if (result?.ok) {
            console.log("Sign in successful, redirecting to /rfqs");
            window.location.href = "/rfqs";
        } else {
            console.warn("Sign in result was not ok but had no error", result);
            setLoading(false);
        }
    };

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
            <Field
                className="mt-6"
                innerLabel="Password"
                placeholder="Enter password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                handleForgotPassword={handleForgotPassword}
            />
            {error && (
                <p className="mt-2 text-red-500 text-body-2">{error}</p>
            )}
            <Button className="mt-6 w-full" isBlack disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="mt-4 text-center text-body-2 text-t-secondary">
                Need an account?&nbsp;
                <button
                    type="button"
                    className="text-t-primary font-bold transition-colors hover:text-primary-01"
                    onClick={handleSignUp}
                >
                    Sign up
                </button>
            </div>
        </form>
    );
};

export default SignIn;
