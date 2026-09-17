"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    LayoutDashboard,
    Users,
    Building2,
    CreditCard,
    BarChart3,
    Bell,
    Settings,
    Package,
    Tags,
    Boxes,
    ShoppingCart,
    ShoppingBag,
    UserRound,
    Truck,
    UserCog,
    Warehouse,
    FileText,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Store,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
    const pathname = usePathname();

    const {
        user,
        logout,
        isSuperAdmin,
    } = useAuth();

    const [collapsed, setCollapsed] =
        useState(false);

    const [mounted, setMounted] =
        useState(false);

    useEffect(() => {
        setMounted(true);

        const saved =
            localStorage.getItem(
                "inventory_sidebar_collapsed"
            );

        if (saved === "true") {
            setCollapsed(true);
        }
    }, []);

    const toggleSidebar = () => {
        const newValue =
            !collapsed;

        setCollapsed(newValue);

        localStorage.setItem(
            "inventory_sidebar_collapsed",
            String(newValue)
        );
    };

    /*
     * =========================================
     * ADMIN MENU
     * =========================================
     */

    const adminMenu = [
        {
            label: "Dashboard",
            href: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            label: "Users",
            href: "/admin/users",
            icon: Users,
        },
        {
            label: "Businesses",
            href: "/admin/businesses",
            icon: Building2,
        },
        {
            label: "Plans",
            href: "/admin/plans",
            icon: CreditCard,
        },
        {
            label: "Subscriptions",
            href: "/admin/subscriptions",
            icon: CreditCard,
        },
        {
            label: "Reports",
            href: "/admin/reports",
            icon: BarChart3,
        },
        {
            label: "Notifications",
            href: "/admin/notifications",
            icon: Bell,
        },
        {
            label: "Settings",
            href: "/admin/settings",
            icon: Settings,
        },
    ];

    /*
     * =========================================
     * USER MENU
     * =========================================
     */

    const userMenu = [
        {
            label: "Dashboard",
            href: "/user/dashboard",
            icon: LayoutDashboard,
        },
        {
            label: "Products",
            href: "/user/products",
            icon: Package,
        },
        {
            label: "Categories",
            href: "/user/categories",
            icon: Tags,
        },
        {
            label: "Inventory",
            href: "/user/inventory",
            icon: Boxes,
        },
        {
            label: "Purchases",
            href: "/user/purchases",
            icon: ShoppingBag,
        },
        {
            label: "Sales",
            href: "/user/sales",
            icon: ShoppingCart,
        },
        {
            label: "Customers",
            href: "/user/customers",
            icon: UserRound,
        },
        {
            label: "Suppliers",
            href: "/user/suppliers",
            icon: Truck,
        },
        {
            label: "Staff",
            href: "/user/staff",
            icon: UserCog,
        },
        {
            label: "Warehouses",
            href: "/user/warehouses",
            icon: Warehouse,
        },
        {
            label: "Invoices",
            href: "/user/invoices",
            icon: FileText,
        },
        {
            label: "Reports",
            href: "/user/reports",
            icon: BarChart3,
        },
        {
            label: "Notifications",
            href: "/user/notifications",
            icon: Bell,
        },
        {
            label: "Settings",
            href: "/user/settings",
            icon: Settings,
        },
    ];

    /*
     * =========================================
     * DETERMINE ROLE
     * =========================================
     */

    const admin =
        mounted
            ? isSuperAdmin ||
              pathname.startsWith(
                  "/admin"
              )
            : pathname.startsWith(
                  "/admin"
              );

    const menu =
        admin
            ? adminMenu
            : userMenu;

    /*
     * =========================================
     * ACTIVE CHECK
     * =========================================
     */

    const isActive = (
        href
    ) => {
        if (
            href ===
            "/admin/dashboard"
        ) {
            return (
                pathname ===
                "/admin/dashboard"
            );
        }

        if (
            href ===
            "/user/dashboard"
        ) {
            return (
                pathname ===
                "/user/dashboard"
            );
        }

        return (
            pathname === href ||
            pathname.startsWith(
                `${href}/`
            )
        );
    };

    /*
     * =========================================
     * LOGOUT
     * =========================================
     */

    const handleLogout = () => {
        logout();
    };

    return (
        <aside
            className={`fixed left-0 top-0 z-40 hidden h-screen border-r border-slate-200 bg-white transition-all duration-300 lg:block ${
                collapsed
                    ? "w-20"
                    : "w-72"
            }`}
        >

            {/* =================================
                BRAND
            ================================== */}

            <div
                className={`flex h-[70px] items-center border-b border-slate-200 ${
                    collapsed
                        ? "justify-center px-3"
                        : "px-4"
                }`}
            >

                <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900">

                        <Package
                            size={21}
                            className="text-white"
                        />

                    </div>

                    {!collapsed && (
                        <div className="min-w-0">

                            <p className="truncate text-base font-bold text-slate-900">
                                InventoryPro
                            </p>

                            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                {admin
                                    ? "Super Admin"
                                    : "Business Panel"}
                            </p>

                        </div>
                    )}

                </div>

            </div>

            {/* =================================
                USER BUSINESS INFO
            ================================== */}

            {!collapsed &&
                !admin && (
                    <div className="border-b border-slate-100 px-4 py-3">

                        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">

                                <Store
                                    size={17}
                                    className="text-slate-600"
                                />

                            </div>

                            <div className="min-w-0">

                                <p className="truncate text-xs font-medium text-slate-400">
                                    BUSINESS
                                </p>

                                <p className="truncate text-sm font-bold text-slate-800">
                                    {user?.businessName ||
                                        "My Business"}
                                </p>

                            </div>

                        </div>

                    </div>
                )}

            {/* =================================
                NAVIGATION
            ================================== */}

            <nav
                className={`h-[calc(100vh-175px)] overflow-y-auto py-4 ${
                    collapsed
                        ? "px-2"
                        : "px-3"
                }`}
            >

                <div className="space-y-1">

                    {menu.map(
                        (item) => {
                            const Icon =
                                item.icon;

                            const active =
                                isActive(
                                    item.href
                                );

                            return (
                                <Link
                                    key={
                                        item.href
                                    }
                                    href={
                                        item.href
                                    }
                                    title={
                                        collapsed
                                            ? item.label
                                            : undefined
                                    }
                                    className={`group flex items-center rounded-xl transition-all ${
                                        collapsed
                                            ? "justify-center px-2 py-3"
                                            : "gap-3 px-3 py-3"
                                    } ${
                                        active
                                            ? "bg-slate-900 text-white shadow-sm"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                                >

                                    <Icon
                                        size={
                                            19
                                        }
                                        strokeWidth={
                                            active
                                                ? 2.2
                                                : 1.8
                                        }
                                        className="shrink-0"
                                    />

                                    {!collapsed && (
                                        <span className="truncate text-sm font-medium">
                                            {
                                                item.label
                                            }
                                        </span>
                                    )}

                                </Link>
                            );
                        }
                    )}

                </div>

            </nav>

            {/* =================================
                BOTTOM AREA
            ================================== */}

            <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-white">

                {/* COLLAPSE */}

                <button
                    type="button"
                    onClick={
                        toggleSidebar
                    }
                    className={`m-3 flex w-[calc(100%-24px)] items-center rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 ${
                        collapsed
                            ? "justify-center"
                            : "justify-center gap-2"
                    }`}
                >

                    {collapsed ? (
                        <ChevronRight
                            size={17}
                        />
                    ) : (
                        <>
                            <ChevronLeft
                                size={17}
                            />

                            <span>
                                Collapse
                            </span>
                        </>
                    )}

                </button>

                {/* LOGOUT */}

                <button
                    type="button"
                    onClick={
                        handleLogout
                    }
                    title={
                        collapsed
                            ? "Logout"
                            : undefined
                    }
                    className={`mb-3 flex w-[calc(100%-24px)] items-center rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 ${
                        collapsed
                            ? "mx-3 justify-center"
                            : "mx-3 gap-3"
                    }`}
                >

                    <LogOut
                        size={18}
                    />

                    {!collapsed && (
                        <span>
                            Logout
                        </span>
                    )}

                </button>

            </div>

        </aside>
    );
}