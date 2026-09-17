"use client";

import { useEffect, useMemo, useState } from "react";

import {
    CreditCard,
    Search,
    RefreshCw,
    Eye,
    Power,
    CalendarDays,
    IndianRupee,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

import {
    subscriptions as demoSubscriptions,
} from "@/data/demoData";

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [selectedSubscription, setSelectedSubscription] =
        useState(null);

    /*
     * LOAD
     */

    useEffect(() => {
        loadSubscriptions();
    }, []);

    const loadSubscriptions = () => {
        const stored = getStorage(
            STORAGE_KEYS.SUBSCRIPTIONS,
            null
        );

        if (Array.isArray(stored)) {
            setSubscriptions(stored);
            return;
        }

        setSubscriptions(
            demoSubscriptions
        );

        setStorage(
            STORAGE_KEYS.SUBSCRIPTIONS,
            demoSubscriptions
        );
    };

    /*
     * SAVE
     */

    const saveSubscriptions = (
        updated
    ) => {
        setSubscriptions(updated);

        setStorage(
            STORAGE_KEYS.SUBSCRIPTIONS,
            updated
        );
    };

    /*
     * SEARCH + FILTER
     */

    const filteredSubscriptions =
        useMemo(() => {
            const value =
                search
                    .toLowerCase()
                    .trim();

            return subscriptions.filter(
                (subscription) => {
                    const matchesSearch =
                        !value ||
                        subscription.businessName
                            ?.toLowerCase()
                            .includes(value) ||
                        subscription.ownerName
                            ?.toLowerCase()
                            .includes(value) ||
                        subscription.planName
                            ?.toLowerCase()
                            .includes(value);

                    const matchesStatus =
                        statusFilter ===
                            "ALL" ||
                        subscription.status ===
                            statusFilter;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );
        }, [
            subscriptions,
            search,
            statusFilter,
        ]);

    /*
     * STATS
     */

    const activeCount =
        subscriptions.filter(
            (item) =>
                item.status === "ACTIVE"
        ).length;

    const expiredCount =
        subscriptions.filter(
            (item) =>
                item.status === "EXPIRED"
        ).length;

    const totalRevenue =
        subscriptions
            .filter(
                (item) =>
                    item.status ===
                    "ACTIVE"
            )
            .reduce(
                (total, item) =>
                    total +
                    Number(
                        item.amount || 0
                    ),
                0
            );

    /*
     * TOGGLE STATUS
     */

    const handleToggleStatus = (
        id
    ) => {
        const subscription =
            subscriptions.find(
                (item) =>
                    item.id === id
            );

        if (!subscription) {
            return;
        }

        const newStatus =
            subscription.status ===
            "ACTIVE"
                ? "CANCELLED"
                : "ACTIVE";

        const updated =
            subscriptions.map(
                (item) => {
                    if (
                        item.id !== id
                    ) {
                        return item;
                    }

                    return {
                        ...item,
                        status:
                            newStatus,
                    };
                }
            );

        saveSubscriptions(
            updated
        );
    };

    /*
     * REFRESH
     */

    const handleRefresh = () => {
        loadSubscriptions();
    };

    return (
        <div className="space-y-6">

            {/* =================================
                HEADER
            ================================== */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>

                    <div className="flex items-center gap-2">

                        <CreditCard
                            size={24}
                            className="text-slate-700"
                        />

                        <h1 className="text-2xl font-bold text-slate-900">
                            Subscriptions
                        </h1>

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage business
                        subscriptions and
                        billing status.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={
                        handleRefresh
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                    <RefreshCw
                        size={17}
                    />

                    Refresh
                </button>

            </div>

            {/* =================================
                STATS
            ================================== */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <StatCard
                    label="Total Subscriptions"
                    value={
                        subscriptions.length
                    }
                    icon={
                        CreditCard
                    }
                />

                <StatCard
                    label="Active"
                    value={
                        activeCount
                    }
                    icon={
                        Power
                    }
                />

                <StatCard
                    label="Expired"
                    value={
                        expiredCount
                    }
                    icon={
                        CalendarDays
                    }
                />

                <StatCard
                    label="Monthly Revenue"
                    value={`₹${totalRevenue.toLocaleString(
                        "en-IN"
                    )}`}
                    icon={
                        IndianRupee
                    }
                />

            </div>

            {/* =================================
                TABLE
            ================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* TABLE HEADER */}

                <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">

                    <div>

                        <h2 className="text-base font-bold text-slate-900">
                            Subscription Directory
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            {
                                filteredSubscriptions.length
                            }{" "}
                            subscriptions
                            found
                        </p>

                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">

                        {/* SEARCH */}

                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 sm:w-72">

                            <Search
                                size={17}
                                className="text-slate-400"
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
                                placeholder="Search subscriptions..."
                                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                            />

                        </div>

                        {/* STATUS */}

                        <select
                            value={
                                statusFilter
                            }
                            onChange={(
                                event
                            ) =>
                                setStatusFilter(
                                    event
                                        .target
                                        .value
                                )
                            }
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none"
                        >
                            <option value="ALL">
                                All Status
                            </option>

                            <option value="ACTIVE">
                                Active
                            </option>

                            <option value="EXPIRED">
                                Expired
                            </option>

                            <option value="CANCELLED">
                                Cancelled
                            </option>
                        </select>

                    </div>

                </div>

                {/* TABLE */}

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1050px]">

                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">

                                <TableHead>
                                    BUSINESS
                                </TableHead>

                                <TableHead>
                                    OWNER
                                </TableHead>

                                <TableHead>
                                    PLAN
                                </TableHead>

                                <TableHead>
                                    AMOUNT
                                </TableHead>

                                <TableHead>
                                    START DATE
                                </TableHead>

                                <TableHead>
                                    END DATE
                                </TableHead>

                                <TableHead>
                                    STATUS
                                </TableHead>

                                <TableHead>
                                    ACTIONS
                                </TableHead>

                            </tr>
                        </thead>

                        <tbody>

                            {filteredSubscriptions.map(
                                (
                                    subscription
                                ) => (
                                    <tr
                                        key={
                                            subscription.id
                                        }
                                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                                    >

                                        {/* BUSINESS */}

                                        <td className="px-6 py-5">

                                            <p className="font-semibold text-slate-900">
                                                {
                                                    subscription.businessName
                                                }
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                {
                                                    subscription.businessId
                                                }
                                            </p>

                                        </td>

                                        {/* OWNER */}

                                        <td className="px-6 py-5">

                                            <p className="font-medium text-slate-700">
                                                {
                                                    subscription.ownerName
                                                }
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                {
                                                    subscription.ownerId
                                                }
                                            </p>

                                        </td>

                                        {/* PLAN */}

                                        <td className="px-6 py-5">

                                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                                                {
                                                    subscription.planName
                                                }
                                            </span>

                                        </td>

                                        {/* AMOUNT */}

                                        <td className="px-6 py-5">

                                            <p className="font-bold text-slate-900">
                                                ₹
                                                {Number(
                                                    subscription.amount ||
                                                        0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                {subscription.billingCycle ===
                                                "YEARLY"
                                                    ? "Yearly"
                                                    : "Monthly"}
                                            </p>

                                        </td>

                                        {/* START */}

                                        <td className="px-6 py-5 text-sm text-slate-600">
                                            {
                                                subscription.startDate
                                            }
                                        </td>

                                        {/* END */}

                                        <td className="px-6 py-5 text-sm text-slate-600">
                                            {
                                                subscription.endDate
                                            }
                                        </td>

                                        {/* STATUS */}

                                        <td className="px-6 py-5">

                                            <StatusBadge
                                                status={
                                                    subscription.status
                                                }
                                            />

                                        </td>

                                        {/* ACTIONS */}

                                        <td className="px-6 py-5">

                                            <div className="flex items-center gap-2">

                                                <button
                                                    type="button"
                                                    title="View"
                                                    onClick={() =>
                                                        setSelectedSubscription(
                                                            subscription
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                                >
                                                    <Eye
                                                        size={
                                                            17
                                                        }
                                                    />
                                                </button>

                                                <button
                                                    type="button"
                                                    title={
                                                        subscription.status ===
                                                        "ACTIVE"
                                                            ? "Cancel"
                                                            : "Activate"
                                                    }
                                                    onClick={() =>
                                                        handleToggleStatus(
                                                            subscription.id
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
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

                    {/* EMPTY */}

                    {filteredSubscriptions.length ===
                        0 && (
                        <div className="p-12 text-center">

                            <CreditCard
                                size={40}
                                className="mx-auto text-slate-300"
                            />

                            <h3 className="mt-4 font-semibold text-slate-900">
                                No subscriptions
                                found
                            </h3>

                            <p className="mt-1 text-sm text-slate-400">
                                Try changing
                                your search or
                                status filter.
                            </p>

                        </div>
                    )}

                </div>

            </div>

            {/* =================================
                VIEW MODAL
            ================================== */}

            {selectedSubscription && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">

                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-200 p-6">

                            <div>

                                <h2 className="text-xl font-bold text-slate-900">
                                    Subscription
                                    Details
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    {
                                        selectedSubscription.id
                                    }
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedSubscription(
                                        null
                                    )
                                }
                                className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
                            >
                                ✕
                            </button>

                        </div>

                        <div className="space-y-4 p-6">

                            <DetailRow
                                label="Business"
                                value={
                                    selectedSubscription.businessName
                                }
                            />

                            <DetailRow
                                label="Owner"
                                value={
                                    selectedSubscription.ownerName
                                }
                            />

                            <DetailRow
                                label="Plan"
                                value={
                                    selectedSubscription.planName
                                }
                            />

                            <DetailRow
                                label="Amount"
                                value={`₹${Number(
                                    selectedSubscription.amount ||
                                        0
                                ).toLocaleString(
                                    "en-IN"
                                )}`}
                            />

                            <DetailRow
                                label="Billing Cycle"
                                value={
                                    selectedSubscription.billingCycle
                                }
                            />

                            <DetailRow
                                label="Start Date"
                                value={
                                    selectedSubscription.startDate
                                }
                            />

                            <DetailRow
                                label="End Date"
                                value={
                                    selectedSubscription.endDate
                                }
                            />

                            <DetailRow
                                label="Status"
                                value={
                                    selectedSubscription.status
                                }
                            />

                        </div>

                        <div className="border-t border-slate-200 p-6">

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedSubscription(
                                        null
                                    )
                                }
                                className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

/* =================================
   STAT CARD
================================== */

function StatCard({
    label,
    value,
    icon: Icon,
}) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div>

                <p className="text-sm text-slate-400">
                    {label}
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                    {value}
                </p>

            </div>

            <div className="rounded-xl bg-slate-100 p-3">
                <Icon
                    size={20}
                    className="text-slate-600"
                />
            </div>

        </div>
    );
}

/* =================================
   TABLE HEAD
================================== */

function TableHead({
    children,
}) {
    return (
        <th className="px-6 py-4 text-left text-xs font-bold tracking-wide text-slate-500">
            {children}
        </th>
    );
}

/* =================================
   STATUS
================================== */

function StatusBadge({
    status,
}) {
    const classes = {
        ACTIVE:
            "bg-emerald-50 text-emerald-600",
        EXPIRED:
            "bg-red-50 text-red-600",
        CANCELLED:
            "bg-orange-50 text-orange-600",
    };

    return (
        <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                classes[status] ||
                "bg-slate-100 text-slate-600"
            }`}
        >
            {status}
        </span>
    );
}

/* =================================
   DETAIL ROW
================================== */

function DetailRow({
    label,
    value,
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">

            <span className="text-sm text-slate-500">
                {label}
            </span>

            <span className="text-right text-sm font-semibold text-slate-900">
                {value}
            </span>

        </div>
    );
}