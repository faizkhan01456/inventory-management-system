"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Package,
  User,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    if (user.role === "SUPER_ADMIN") {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/user/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError("Please enter username and password.");
      return;
    }

    setIsSubmitting(true);

    const result = login(username, password);

    if (!result.success) {
      setError(result.message);
      setIsSubmitting(false);
      return;
    }

    if (result.user.role === "SUPER_ADMIN") {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/user/dashboard");
    }
  };

  const fillAdmin = () => {
    setUsername("superadmin");
    setPassword("Admin@123");
    setError("");
  };

  const fillUser = () => {
    setUsername("rahul123");
    setPassword("Rahul@123");
    setError("");
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Side */}
        <section className="hidden flex-col justify-between bg-slate-900 p-10 text-white lg:flex">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-900">
                <Package size={24} />
              </div>

              <div>
                <h1 className="text-lg font-bold">
                  InventoryPro
                </h1>
                <p className="text-xs text-slate-400">
                  Inventory Management
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-lg">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-slate-400">
              Smart Inventory Management
            </p>

            <h2 className="text-5xl font-bold leading-tight">
              Manage your business inventory with confidence.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Manage products, stock, purchases, sales, customers,
              suppliers and business operations from one powerful
              dashboard.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-4">
                <p className="text-2xl font-bold">500+</p>
                <p className="mt-1 text-xs text-slate-400">
                  Businesses
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-4">
                <p className="text-2xl font-bold">85K+</p>
                <p className="mt-1 text-xs text-slate-400">
                  Products
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-4">
                <p className="text-2xl font-bold">24/7</p>
                <p className="mt-1 text-xs text-slate-400">
                  Tracking
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            © 2026 InventoryPro. Demo Application.
          </p>
        </section>

        {/* Login */}
        <section className="flex items-center justify-center bg-slate-50 px-5 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white lg:mx-0">
                <Package size={28} />
              </div>

              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to access your inventory dashboard.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/40"
            >
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Username
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={username}
                      onChange={(event) =>
                        setUsername(event.target.value)
                      }
                      placeholder="Enter username"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter password"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                  {!isSubmitting && <ArrowRight size={18} />}
                </button>
              </div>

              {/* Demo Credentials */}
              <div className="mt-7 border-t border-slate-100 pt-6">
                <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Demo Credentials
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={fillAdmin}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-slate-400 hover:bg-white"
                  >
                    <p className="text-xs font-bold text-slate-800">
                      Super Admin
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      superadmin
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={fillUser}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-slate-400 hover:bg-white"
                  >
                    <p className="text-xs font-bold text-slate-800">
                      Demo User
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      rahul123
                    </p>
                  </button>
                </div>
              </div>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              Frontend Demo • No Backend Connected
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}