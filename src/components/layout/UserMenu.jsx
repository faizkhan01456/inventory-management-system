"use client";

import {
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const isSuperAdmin =
    user.role === "SUPER_ADMIN";

  const profilePath = isSuperAdmin
    ? "/admin/profile"
    : "/user/profile";

  // Direct profile navigation
  const handleProfile = () => {
    setOpen(false);
    router.push(profilePath);
  };

  // Logout
  const handleLogout = () => {
    setOpen(false);
    logout();
    router.replace("/login");
  };

  return (
    <div className="relative">
      {/* =========================
          PROFILE BUTTON
          ========================= */}
      <div className="flex items-center">
        {/* Avatar + User Information */}
        <button
          type="button"
          onClick={handleProfile}
          className="flex items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-slate-100"
        >
          {/* Avatar */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
            {user.name
              ?.charAt(0)
              ?.toUpperCase() || "U"}
          </div>

          {/* Name + Role */}
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">
              {user.name || "User"}
            </p>

            <p className="text-xs text-slate-500">
              {isSuperAdmin
                ? "Super Admin"
                : user.role === "ADMIN"
                ? "Administrator"
                : "Administrator"}
            </p>
          </div>
        </button>

        {/* =========================
            DROPDOWN ARROW
            ========================= */}
        <button
          type="button"
          onClick={() =>
            setOpen((previous) => !previous)
          }
          aria-label="Open user menu"
          className="ml-1 rounded-lg p-2 transition hover:bg-slate-100"
        >
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* =========================
          DROPDOWN
          ========================= */}
      {open && (
        <>
          {/* Outside click layer */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 h-full w-full cursor-default"
          />

          <div className="absolute right-0 top-14 z-50 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            {/* User Information */}
            <div className="border-b border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {user.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user.name || "User"}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    @{user.username || "user"}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile */}
            <div className="p-2">
              <button
                type="button"
                onClick={handleProfile}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <User size={17} />
                </div>

                <div className="text-left">
                  <p>My Profile</p>

                  <p className="text-xs font-normal text-slate-400">
                    Manage your account
                  </p>
                </div>
              </button>
            </div>

            {/* Logout */}
            <div className="border-t border-slate-100 p-2">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                  <LogOut size={17} />
                </div>

                <div className="text-left">
                  <p>Logout</p>

                  <p className="text-xs font-normal text-red-400">
                    Sign out of your account
                  </p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}