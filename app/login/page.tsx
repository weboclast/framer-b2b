"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Login from "@/components/Login";
import Card from "@/components/Card";

function LoginContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-h3 mb-2">Framer RFQ Hub</h1>
        <p className="text-body-2 text-t-tertiary">
          Sign in to manage your RFQs
        </p>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 text-red-500 rounded-lg text-body-2">
          {error}
        </div>
      )}
      <Login />
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-b-surface1 p-4">
      <Card className="w-full max-w-md p-8">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginContent />
        </Suspense>
      </Card>
    </div>
  );
}
