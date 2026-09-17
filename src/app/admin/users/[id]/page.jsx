"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
    ArrowLeft,
    User,
    Building2,
    Mail,
    Phone,
    Calendar,
    CreditCard,
    ShieldCheck,
} from "lucide-react";

import {
    getStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

import { demoUsers } from "@/data/demoData";

export default function UserDetailPage() {
    const params = useParams();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!params?.id) {
            setLoading(false);
            return;
        }

        const users = getStorage(
            STORAGE_KEYS.USERS,
            demoUsers
        );

        const foundUser = users.find(
            (item) =>
                String(item.id) ===
                String(params.id)
        );

        setUser(foundUser || null);
        setLoading(false);
    }, [params?.id]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading user...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                        <User
                            size={26}
                            className="text-slate-500"
                        />
                    </div>

                    <h2 className="mt-4 text-lg font-bold text-slate-900">
                        User Not Found
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        The user you are looking
                        for does not exist or has
                        been deleted.
                    </p>

                    <Link
                        href="/admin/users"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                        <ArrowLeft size={16} />

                        Back to Users
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* ========================================
                BACK BUTTON
            ======================================== */}

            <Link
                href="/admin/users"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
                <ArrowLeft size={16} />

                Back to Users
            </Link>

            {/* ========================================
                USER PROFILE CARD
            ======================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Profile Header */}

                <div className="bg-slate-900 p-6 md:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        {/* Avatar */}

                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/10">
                            <User size={30} />
                        </div>

                        {/* User Info */}

                        <div className="min-w-0">
                            <h1 className="text-2xl font-bold text-white">
                                {user.name ||
                                    "Unnamed User"}
                            </h1>

                            <p className="mt-1 text-sm text-slate-300">
                                @
                                {user.username ||
                                    "username"}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        user.status ===
                                        "ACTIVE"
                                            ? "bg-emerald-400/10 text-emerald-300"
                                            : "bg-red-400/10 text-red-300"
                                    }`}
                                >
                                    {user.status ||
                                        "INACTIVE"}
                                </span>

                                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
                                    {user.role ||
                                        "USER"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================
                    USER DETAILS
                ======================================== */}

                <div className="p-6 md:p-8">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-slate-900">
                            User Information
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Account and business
                            details.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <InfoCard
                            icon={Building2}
                            label="Business"
                            value={
                                user.businessName ||
                                "Not provided"
                            }
                        />

                        <InfoCard
                            icon={Mail}
                            label="Email"
                            value={
                                user.email ||
                                "Not provided"
                            }
                        />

                        <InfoCard
                            icon={Phone}
                            label="Phone"
                            value={
                                user.phone ||
                                "Not provided"
                            }
                        />

                        <InfoCard
                            icon={CreditCard}
                            label="Subscription Plan"
                            value={
                                user.plan ||
                                "FREE"
                            }
                        />

                        <InfoCard
                            icon={Calendar}
                            label="Created At"
                            value={
                                user.createdAt ||
                                "Not available"
                            }
                        />

                        <InfoCard
                            icon={ShieldCheck}
                            label="Role"
                            value={
                                user.role ||
                                "USER"
                            }
                        />
                    </div>
                </div>
            </div>

            {/* ========================================
                ACCOUNT SUMMARY
            ======================================== */}

            <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard
                    label="Account Status"
                    value={
                        user.status ===
                        "ACTIVE"
                            ? "Active"
                            : "Inactive"
                    }
                    valueClass={
                        user.status ===
                        "ACTIVE"
                            ? "text-emerald-600"
                            : "text-red-600"
                    }
                />

                <SummaryCard
                    label="Plan"
                    value={
                        user.plan ||
                        "FREE"
                    }
                />

                <SummaryCard
                    label="Account Type"
                    value={
                        user.role ||
                        "USER"
                    }
                />
            </div>
        </div>
    );
}

/* ========================================
   INFO CARD
======================================== */

function InfoCard({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Icon size={18} />
                </div>

                <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">
                        {label}
                    </p>

                    <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ========================================
   SUMMARY CARD
======================================== */

function SummaryCard({
    label,
    value,
    valueClass = "text-slate-900",
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-400">
                {label}
            </p>

            <p
                className={`mt-2 text-xl font-bold ${valueClass}`}
            >
                {value}
            </p>
        </div>
    );
}