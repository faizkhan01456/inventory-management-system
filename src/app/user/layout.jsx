"use client";

import { useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import MobileSidebar from "@/components/layout/MobileSidebar";

export default function UserLayout({
    children,
}) {
    const [mobileSidebarOpen, setMobileSidebarOpen] =
        useState(false);

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Mobile Sidebar */}
            <MobileSidebar
                isOpen={mobileSidebarOpen}
                onClose={() =>
                    setMobileSidebarOpen(false)
                }
            />

            {/* Main Content */}
            <div className="lg:ml-72">

                <Topbar
                    onMenuClick={() =>
                        setMobileSidebarOpen(true)
                    }
                />

                <main className="min-h-[calc(100vh-72px)] p-4 sm:p-6 lg:p-8">
                    {children}
                </main>

            </div>

        </div>
    );
}