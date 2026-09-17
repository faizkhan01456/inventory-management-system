"use client";

import { ChevronDown, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((previous) => !previous)}
        className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-100"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
          {user.name?.charAt(0)?.toUpperCase()}
        </div>

        <div className="hidden text-left sm:block">
          <p className="text-sm font-semibold text-slate-800">
            {user.name}
          </p>

          <p className="text-xs text-slate-500">
            {user.role === "SUPER_ADMIN"
              ? "Super Admin"
              : user.businessName}
          </p>
        </div>

        <ChevronDown
          size={16}
          className="text-slate-400"
        />
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-4">
            <p className="text-sm font-semibold text-slate-900">
              {user.name}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              @{user.username}
            </p>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50"
          >
            <User size={17} />
            Profile
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}