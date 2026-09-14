"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function login() {
    const response = await fetch("/api/admin-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      localStorage.setItem("admin", "true");
      router.push("/admin");
    } else {
      setError("Incorrect password");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">
          Admin Login
        </h1>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="border p-2"
        />

        <button
          onClick={login}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Login
        </button>

        {error && <p>{error}</p>}
      </div>
    </div>
  );
}