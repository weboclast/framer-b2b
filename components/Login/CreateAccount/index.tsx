import { useState } from "react";
import { signIn } from "next-auth/react";
import Button from "@/components/Button";
import Field from "@/components/Field";

type CreateAccountProps = {
    handleSignIn: () => void;
};

const CreateAccount = ({ handleSignIn }: CreateAccountProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Registration failed");
                setLoading(false);
                return;
            }

            console.log("Registration successful for", email);
            // Auto login after success
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });
            console.log("Registration auto-login result:", result);

            if (result?.ok) {
                console.log("Auto-login successful, redirecting to /rfqs");
                window.location.href = "/rfqs";
            } else {
                console.error("Auto-login failed after registration", result?.error);
                // If auto-login fails, go to sign in anyway
                handleSignIn();
            }
        } catch (err) {
            console.error("Registration catch block error:", err);
            setError("Something went wrong during registration");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Field
                className="mt-6"
                innerLabel="Name"
                placeholder="Enter your name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
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
            />
            {error && (
                <p className="mt-2 text-red-500 text-body-2">{error}</p>
            )}
            <Button className="mt-6 w-full" isBlack disabled={loading}>
                {loading ? "Creating account..." : "Create an account"}
            </Button>
            <div className="mt-4 text-center text-body-2 text-t-secondary">
                Already have an account?&nbsp;
                <button
                    type="button"
                    className="text-t-primary font-bold transition-colors hover:text-primary-01"
                    onClick={handleSignIn}
                >
                    Sign in
                </button>
            </div>
        </form>
    );
};

export default CreateAccount;
