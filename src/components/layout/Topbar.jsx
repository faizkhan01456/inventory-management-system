"use client";

import {
  Bell,
  Search,
  Menu,
  ChevronDown,
  User,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const router = useRouter();

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const profilePath = isSuperAdmin
    ? "/admin/profile"
    : "/user/profile";

  const notificationPath = isSuperAdmin
    ? "/admin/notifications"
    : "/user/notifications";

  const handleProfileClick = () => {
    router.push(profilePath);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={21} />
        </button>

        {/* Search */}
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex md:w-72">
          <Search
            size={17}
            className="text-slate-400"
          />

          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />

          <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">
            Ctrl K
          </span>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Link
          href={notificationPath}
          className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"
        >
          <Bell size={19} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </Link>

        {/* Divider */}
        <div className="mx-1 h-7 w-px bg-slate-200" />

        {/* Profile Button */}
        <button
          type="button"
          onClick={handleProfileClick}
          title="Open Profile"
          className="group flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
        >
          {/* Avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white transition group-hover:bg-slate-800">
            {user?.name?.charAt(0)?.toUpperCase() || (
              <User size={18} />
            )}
          </div>

          {/* User Info */}
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-slate-900">
              {user?.name || "Super Admin"}
            </p>

            <p className="text-xs text-slate-400">
              {isSuperAdmin
                ? "Super Admin"
                : user?.role === "ADMIN"
                ? "Administrator"
                : "Administrator"}
            </p>
          </div>

          {/* Arrow */}
          <ChevronDown
            size={16}
            className="hidden text-slate-400 transition group-hover:text-slate-600 sm:block"
          />
        </button>
      </div>
    </header>
  );
}