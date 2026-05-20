"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { fetchApi } from "@/lib/api";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGoogleLoaded(true);
      };
      document.body.appendChild(script);
    };

    if (!window.google) {
      loadGoogleScript();
    } else {
      setGoogleLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (googleLoaded && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        callback: handleGoogleCallback,
        auto_select: false,
      });
    }
  }, [googleLoaded]);

  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  const handleGoogleCallback = async (response: any) => {
    setError(null);
    setLoading(true);

    try {
      const data = await fetchApi("/auth/google", {
        method: "POST",
        body: JSON.stringify({ credential: response.credential }),
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
      setError(err.message || "Error al iniciar sesión con Google");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
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
      setError(err.message || "Error al iniciar sesión");
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
          <h2 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">¡Bienvenido de nuevo!</h2>
          <p className="mt-2 text-sm text-zinc-500">Ingresa a tu cuenta para continuar.</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
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
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="password">
                Contraseña
              </label>
              <Link href="#" className="text-xs text-primary hover:underline font-semibold">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input text-zinc-900 dark:text-white"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="w-full btn-primary !py-3 font-bold text-lg disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200 dark:border-zinc-800"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500 font-semibold tracking-wider">O continuar con</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || !googleLoaded}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="font-semibold text-zinc-700 dark:text-zinc-200">
            {loading ? "Iniciando..." : "Continuar con Google"}
          </span>
        </button>

        <p className="text-center text-sm text-zinc-500">
          ¿No tienes una cuenta?{" "}
          <Link href="#" className="text-primary hover:underline font-bold">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
