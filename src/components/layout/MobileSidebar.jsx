"use client";

import { X } from "lucide-react";
import Sidebar from "./Sidebar";

export default function MobileSidebar({ open, onClose }) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        onClick={onClose}
      />

      <div className="fixed left-0 top-0 z-50 h-screen lg:hidden">
        <div className="absolute right-[-42px] top-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-white p-2 text-slate-600 shadow-lg"
          >
            <X size={18} />
          </button>
        </div>

        <Sidebar
          collapsed={false}
          setCollapsed={onClose}
          mobile
        />
      </div>
    </>
  );
}