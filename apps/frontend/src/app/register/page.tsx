"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { fetchApi } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const data = await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const role = data.user.role;
      if (role === "ADMIN") {
        router.push("/paneladmin");
      } else if (role === "KITCHEN") {
        router.push("/panelkitchen");
      } else {
        router.push("/panel");
      }
    } catch (err: any) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 transition-colors relative">
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>
      <div className="card max-w-md w-full p-8 space-y-8 bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800">
        <div className="text-center">
          <Link href="/" className="text-3xl font-bold text-primary">
            RESTAURANT<span className="text-secondary">VEG</span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">Crea tu cuenta</h2>
          <p className="mt-2 text-sm text-zinc-500">Regístrate para comenzar a ordenar.</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="name">
              Nombre completo
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              className="input text-zinc-900 dark:text-white"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              className="input text-zinc-900 dark:text-white"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input text-zinc-900 dark:text-white"
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="confirmPassword">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="input text-zinc-900 dark:text-white"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary !py-3 font-bold text-lg disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="text-primary hover:underline font-bold">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
