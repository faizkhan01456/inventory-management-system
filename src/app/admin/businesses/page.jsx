"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import {
    Building2,
    Search,
    Plus,
    RefreshCw,
    Eye,
    Power,
    Users,
    Package,
    ShoppingCart,
    IndianRupee,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

import { businesses as demoBusinesses } from "@/data/demoData";

export default function BusinessesPage() {
    const [businesses, setBusinesses] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    /*
     * Load businesses
     */

    useEffect(() => {
        loadBusinesses();
    }, []);

    const loadBusinesses = () => {
        setLoading(true);

        const storedBusinesses =
            getStorage(
                STORAGE_KEYS.BUSINESSES,
                null
            );

        if (
            Array.isArray(
                storedBusinesses
            )
        ) {
            setBusinesses(
                storedBusinesses
            );
        } else {
            setBusinesses(
                demoBusinesses
            );

            setStorage(
                STORAGE_KEYS.BUSINESSES,
                demoBusinesses
            );
        }

        setLoading(false);
    };

    /*
     * Toggle business status
     */

    const handleToggleStatus = (
        id
    ) => {
        const business =
            businesses.find(
                (item) =>
                    item.id === id
            );

        if (!business) {
            return;
        }

        const newStatus =
            business.status ===
            "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const updatedBusinesses =
            businesses.map(
                (item) => {
                    if (
                        item.id !== id
                    ) {
                        return item;
                    }

                    return {
                        ...item,
                        status: newStatus,
                    };
                }
            );

        setBusinesses(
            updatedBusinesses
        );

        setStorage(
            STORAGE_KEYS.BUSINESSES,
            updatedBusinesses
        );
    };

    /*
     * Search
     */

    const filteredBusinesses =
        useMemo(() => {
            const value =
                search
                    .toLowerCase()
                    .trim();

            if (!value) {
                return businesses;
            }

            return businesses.filter(
                (business) =>
                    business.name
                        ?.toLowerCase()
                        .includes(value) ||

                    business.ownerName
                        ?.toLowerCase()
                        .includes(value) ||

                    business.email
                        ?.toLowerCase()
                        .includes(value) ||

                    business.phone
                        ?.toLowerCase()
                        .includes(value) ||

                    business.plan
                        ?.toLowerCase()
                        .includes(value)
            );
        }, [
            businesses,
            search,
        ]);

    /*
     * Stats
     */

    const totalBusinesses =
        businesses.length;

    const activeBusinesses =
        businesses.filter(
            (business) =>
                business.status ===
                "ACTIVE"
        ).length;

    const inactiveBusinesses =
        businesses.filter(
            (business) =>
                business.status !==
                "ACTIVE"
        ).length;

    return (
        <div className="space-y-6">
            {/* ====================================
                HEADER
            ===================================== */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <Building2
                            size={24}
                            className="text-slate-700"
                        />

                        <h1 className="text-2xl font-bold text-slate-900">
                            Businesses
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage all businesses
                        registered on the
                        platform.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={
                        loadBusinesses
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    <RefreshCw
                        size={17}
                    />

                    Refresh
                </button>
            </div>

            {/* ====================================
                STATS
            ===================================== */}

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    icon={Building2}
                    label="Total Businesses"
                    value={
                        totalBusinesses
                    }
                />

                <StatCard
                    icon={Users}
                    label="Active Businesses"
                    value={
                        activeBusinesses
                    }
                    valueClass="text-emerald-600"
                />

                <StatCard
                    icon={Power}
                    label="Inactive Businesses"
                    value={
                        inactiveBusinesses
                    }
                    valueClass="text-red-600"
                />
            </div>

            {/* ====================================
                TABLE
            ===================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Toolbar */}

                <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="font-bold text-slate-900">
                            Business Directory
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            {
                                filteredBusinesses.length
                            }{" "}
                            businesses found
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {/* Search */}

                        <div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 sm:w-80">
                            <Search
                                size={17}
                                className="shrink-0 text-slate-400"
                            />

                            <input
                                type="text"
                                value={
                                    search
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Search businesses..."
                                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}

                {loading ? (
                    <LoadingState />
                ) : (
                    <BusinessTable
                        businesses={
                            filteredBusinesses
                        }
                        onToggleStatus={
                            handleToggleStatus
                        }
                    />
                )}
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| BUSINESS TABLE
|--------------------------------------------------------------------------
*/

function BusinessTable({
    businesses,
    onToggleStatus,
}) {
    if (businesses.length === 0) {
        return (
            <div className="p-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <Building2
                        size={25}
                        className="text-slate-400"
                    />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-800">
                    No businesses found
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                    Try changing your
                    search.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Business
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Owner
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Plan
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Status
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Created
                        </th>

                        <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                    {businesses.map(
                        (business) => (
                            <tr
                                key={
                                    business.id
                                }
                                className="transition hover:bg-slate-50"
                            >
                                {/* Business */}

                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                            <Building2
                                                size={
                                                    19
                                                }
                                            />
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-slate-900">
                                                {
                                                    business.name
                                                }
                                            </p>

                                            <p className="mt-0.5 text-xs text-slate-400">
                                                {
                                                    business.email
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Owner */}

                                <td className="px-5 py-4">
                                    <p className="text-sm font-medium text-slate-700">
                                        {
                                            business.ownerName
                                        }
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        {
                                            business.phone
                                        }
                                    </p>
                                </td>

                                {/* Plan */}

                                <td className="px-5 py-4">
                                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                                        {
                                            business.plan
                                        }
                                    </span>
                                </td>

                                {/* Status */}

                                <td className="px-5 py-4">
                                    <span
                                        className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                                            business.status ===
                                            "ACTIVE"
                                                ? "bg-emerald-50 text-emerald-600"
                                                : "bg-red-50 text-red-600"
                                        }`}
                                    >
                                        {
                                            business.status
                                        }
                                    </span>
                                </td>

                                {/* Created */}

                                <td className="px-5 py-4 text-sm text-slate-500">
                                    {
                                        business.createdAt
                                    }
                                </td>

                                {/* Actions */}

                                <td className="px-5 py-4">
                                    <div className="flex justify-end gap-1">
                                        <Link
                                            href={`/admin/businesses/${business.id}`}
                                            title="View Business"
                                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                        >
                                            <Eye
                                                size={
                                                    17
                                                }
                                            />
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                onToggleStatus(
                                                    business.id
                                                )
                                            }
                                            title={
                                                business.status ===
                                                "ACTIVE"
                                                    ? "Deactivate"
                                                    : "Activate"
                                            }
                                            className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                                        >
                                            <Power
                                                size={
                                                    17
                                                }
                                            />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function StatCard({
    icon: Icon,
    label,
    value,
    valueClass = "text-slate-900",
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-400">
                        {label}
                    </p>

                    <p
                        className={`mt-2 text-2xl font-bold ${valueClass}`}
                    >
                        {value}
                    </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Icon size={19} />
                </div>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| LOADING
|--------------------------------------------------------------------------
*/

function LoadingState() {
    return (
        <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

                <p className="mt-3 text-sm text-slate-500">
                    Loading businesses...
                </p>
            </div>
        </div>
    );
}