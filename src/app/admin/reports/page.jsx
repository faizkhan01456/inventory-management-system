"use client";

import { useEffect, useMemo, useState } from "react";

import {
    BarChart3,
    Building2,
    CreditCard,
    Download,
    RefreshCw,
    Users,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Crown,
} from "lucide-react";

import {
    getStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

import {
    demoUsers,
    businesses as demoBusinesses,
    plans as demoPlans,
    subscriptions as demoSubscriptions,
} from "@/data/demoData";

export default function AdminReportsPage() {
    const [users, setUsers] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [plans, setPlans] = useState([]);
    const [subscriptions, setSubscriptions] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    /*
     * =========================================
     * LOAD REPORT DATA
     * =========================================
     */

    useEffect(() => {
        loadReportData();
    }, []);

    const loadReportData = () => {
        setLoading(true);

        const storedUsers = getStorage(
            STORAGE_KEYS.USERS,
            demoUsers
        );

        const storedBusinesses =
            getStorage(
                STORAGE_KEYS.BUSINESSES,
                demoBusinesses
            );

        const storedPlans = getStorage(
            STORAGE_KEYS.PLANS,
            demoPlans
        );

        const storedSubscriptions =
            getStorage(
                STORAGE_KEYS.SUBSCRIPTIONS,
                demoSubscriptions
            );

        setUsers(
            Array.isArray(storedUsers)
                ? storedUsers
                : demoUsers
        );

        setBusinesses(
            Array.isArray(
                storedBusinesses
            )
                ? storedBusinesses
                : demoBusinesses
        );

        setPlans(
            Array.isArray(storedPlans)
                ? storedPlans
                : demoPlans
        );

        setSubscriptions(
            Array.isArray(
                storedSubscriptions
            )
                ? storedSubscriptions
                : demoSubscriptions
        );

        setLoading(false);
    };

    /*
     * =========================================
     * USER STATS
     * =========================================
     */

    const activeUsers =
        users.filter(
            (user) =>
                user.status === "ACTIVE"
        ).length;

    const inactiveUsers =
        users.filter(
            (user) =>
                user.status !== "ACTIVE"
        ).length;

    /*
     * =========================================
     * BUSINESS STATS
     * =========================================
     */

    const activeBusinesses =
        businesses.filter(
            (business) =>
                business.status === "ACTIVE"
        ).length;

    const inactiveBusinesses =
        businesses.filter(
            (business) =>
                business.status !== "ACTIVE"
        ).length;

    /*
     * =========================================
     * SUBSCRIPTION STATS
     * =========================================
     */

    const activeSubscriptions =
        subscriptions.filter(
            (subscription) =>
                subscription.status ===
                "ACTIVE"
        ).length;

    const expiredSubscriptions =
        subscriptions.filter(
            (subscription) =>
                subscription.status ===
                "EXPIRED"
        ).length;

    const cancelledSubscriptions =
        subscriptions.filter(
            (subscription) =>
                subscription.status ===
                "CANCELLED"
        ).length;

    /*
     * =========================================
     * REVENUE
     * =========================================
     */

    const monthlyRevenue =
        subscriptions
            .filter(
                (subscription) =>
                    subscription.status ===
                    "ACTIVE"
            )
            .reduce(
                (total, subscription) =>
                    total +
                    Number(
                        subscription.amount ||
                            0
                    ),
                0
            );

    /*
     * =========================================
     * PLAN DISTRIBUTION
     * =========================================
     */

    const planDistribution =
        useMemo(() => {
            return plans.map(
                (plan) => {
                    const count =
                        subscriptions.filter(
                            (
                                subscription
                            ) =>
                                subscription.planId ===
                                    plan.id ||
                                subscription.planName
                                    ?.toLowerCase() ===
                                    plan.name
                                        ?.toLowerCase()
                        ).length;

                    const activeCount =
                        subscriptions.filter(
                            (
                                subscription
                            ) =>
                                subscription.status ===
                                    "ACTIVE" &&
                                (
                                    subscription.planId ===
                                        plan.id ||
                                    subscription.planName
                                        ?.toLowerCase() ===
                                        plan.name
                                            ?.toLowerCase()
                                )
                        ).length;

                    return {
                        ...plan,
                        count,
                        activeCount,
                    };
                }
            );
        }, [
            plans,
            subscriptions,
        ]);

    /*
     * =========================================
     * REVENUE BY PLAN
     * =========================================
     */

    const revenueByPlan =
        useMemo(() => {
            return plans.map(
                (plan) => {
                    const revenue =
                        subscriptions
                            .filter(
                                (
                                    subscription
                                ) =>
                                    subscription.status ===
                                        "ACTIVE" &&
                                    (
                                        subscription.planId ===
                                            plan.id ||
                                        subscription.planName
                                            ?.toLowerCase() ===
                                            plan.name
                                                ?.toLowerCase()
                                    )
                            )
                            .reduce(
                                (
                                    total,
                                    subscription
                                ) =>
                                    total +
                                    Number(
                                        subscription.amount ||
                                            0
                                    ),
                                0
                            );

                    return {
                        ...plan,
                        revenue,
                    };
                }
            );
        }, [
            plans,
            subscriptions,
        ]);

    /*
     * =========================================
     * RECENT SUBSCRIPTIONS
     * =========================================
     */

    const recentSubscriptions =
        [...subscriptions]
            .sort(
                (a, b) =>
                    new Date(
                        b.createdAt
                    ) -
                    new Date(
                        a.createdAt
                    )
            )
            .slice(0, 6);

    /*
     * =========================================
     * REFRESH
     * =========================================
     */

    const handleRefresh = () => {
        loadReportData();
    };

    /*
     * =========================================
     * EXPORT REPORT
     * =========================================
     */

    const handleExport = () => {
        const report = {
            generatedAt:
                new Date().toISOString(),

            users: {
                total: users.length,
                active: activeUsers,
                inactive: inactiveUsers,
            },

            businesses: {
                total: businesses.length,
                active: activeBusinesses,
                inactive:
                    inactiveBusinesses,
            },

            plans: {
                total: plans.length,
                active: plans.filter(
                    (plan) =>
                        plan.status ===
                        "ACTIVE"
                ).length,
            },

            subscriptions: {
                total:
                    subscriptions.length,
                active:
                    activeSubscriptions,
                expired:
                    expiredSubscriptions,
                cancelled:
                    cancelledSubscriptions,
            },

            monthlyRevenue,

            planDistribution:
                planDistribution.map(
                    (plan) => ({
                        plan:
                            plan.name,
                        subscriptions:
                            plan.count,
                        active:
                            plan.activeCount,
                    })
                ),

            revenueByPlan:
                revenueByPlan.map(
                    (plan) => ({
                        plan:
                            plan.name,
                        revenue:
                            plan.revenue,
                    })
                ),
        };

        const blob =
            new Blob(
                [
                    JSON.stringify(
                        report,
                        null,
                        2
                    ),
                ],
                {
                    type: "application/json",
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href = url;

        link.download =
            `inventory-report-${new Date()
                .toISOString()
                .split("T")[0]}.json`;

        document.body.appendChild(
            link
        );

        link.click();

        document.body.removeChild(
            link
        );

        URL.revokeObjectURL(url);
    };

    /*
     * =========================================
     * LOADING
     * =========================================
     */

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">

                <div className="text-center">

                    <RefreshCw
                        size={28}
                        className="mx-auto animate-spin text-slate-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading reports...
                    </p>

                </div>

            </div>
        );
    }

    /*
     * =========================================
     * UI
     * =========================================
     */

    return (
        <div className="space-y-6">

            {/* =================================
                HEADER
            ================================== */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>

                    <div className="flex items-center gap-2">

                        <BarChart3
                            size={24}
                            className="text-slate-700"
                        />

                        <h1 className="text-2xl font-bold text-slate-900">
                            Reports
                        </h1>

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Overview of your
                        InventoryPro system.
                    </p>

                </div>

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={
                            handleRefresh
                        }
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >

                        <RefreshCw
                            size={17}
                        />

                        Refresh

                    </button>

                    <button
                        type="button"
                        onClick={
                            handleExport
                        }
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    >

                        <Download
                            size={17}
                        />

                        Export Report

                    </button>

                </div>

            </div>

            {/* =================================
                MAIN STATS
            ================================== */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <ReportCard
                    title="Total Users"
                    value={
                        users.length
                    }
                    subtitle={`${activeUsers} active`}
                    icon={Users}
                />

                <ReportCard
                    title="Total Businesses"
                    value={
                        businesses.length
                    }
                    subtitle={`${activeBusinesses} active`}
                    icon={Building2}
                />

                <ReportCard
                    title="Active Subscriptions"
                    value={
                        activeSubscriptions
                    }
                    subtitle={`${expiredSubscriptions} expired`}
                    icon={CreditCard}
                />

                <ReportCard
                    title="Monthly Revenue"
                    value={`₹${monthlyRevenue.toLocaleString(
                        "en-IN"
                    )}`}
                    subtitle="From active subscriptions"
                    icon={TrendingUp}
                />

            </div>

            {/* =================================
                USER + BUSINESS STATUS
            ================================== */}

            <div className="grid gap-6 lg:grid-cols-2">

                {/* USERS */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <h2 className="text-base font-bold text-slate-900">
                                User Overview
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                User account
                                status
                            </p>

                        </div>

                        <Users
                            size={20}
                            className="text-slate-400"
                        />

                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-3">

                        <StatusBox
                            label="Total"
                            value={
                                users.length
                            }
                        />

                        <StatusBox
                            label="Active"
                            value={
                                activeUsers
                            }
                            type="success"
                        />

                        <StatusBox
                            label="Inactive"
                            value={
                                inactiveUsers
                            }
                            type="danger"
                        />

                    </div>

                </div>

                {/* BUSINESSES */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <h2 className="text-base font-bold text-slate-900">
                                Business Overview
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Business account
                                status
                            </p>

                        </div>

                        <Building2
                            size={20}
                            className="text-slate-400"
                        />

                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-3">

                        <StatusBox
                            label="Total"
                            value={
                                businesses.length
                            }
                        />

                        <StatusBox
                            label="Active"
                            value={
                                activeBusinesses
                            }
                            type="success"
                        />

                        <StatusBox
                            label="Inactive"
                            value={
                                inactiveBusinesses
                            }
                            type="danger"
                        />

                    </div>

                </div>

            </div>

            {/* =================================
                SUBSCRIPTIONS
            ================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                    <div>

                        <h2 className="text-base font-bold text-slate-900">
                            Subscription Overview
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            Current subscription
                            status
                        </p>

                    </div>

                    <CreditCard
                        size={20}
                        className="text-slate-400"
                    />

                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <SubscriptionStat
                        label="Total"
                        value={
                            subscriptions.length
                        }
                    />

                    <SubscriptionStat
                        label="Active"
                        value={
                            activeSubscriptions
                        }
                        type="success"
                    />

                    <SubscriptionStat
                        label="Expired"
                        value={
                            expiredSubscriptions
                        }
                        type="danger"
                    />

                    <SubscriptionStat
                        label="Cancelled"
                        value={
                            cancelledSubscriptions
                        }
                        type="warning"
                    />

                </div>

            </div>

            {/* =================================
                PLAN DISTRIBUTION
            ================================== */}

            <div className="grid gap-6 lg:grid-cols-2">

                {/* PLAN DISTRIBUTION */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <h2 className="text-base font-bold text-slate-900">
                                Plan Distribution
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Subscriptions by
                                plan
                            </p>

                        </div>

                        <Crown
                            size={20}
                            className="text-slate-400"
                        />

                    </div>

                    <div className="mt-6 space-y-5">

                        {planDistribution.map(
                            (plan) => {
                                const percentage =
                                    subscriptions.length >
                                    0
                                        ? Math.round(
                                              (plan.count /
                                                  subscriptions.length) *
                                                  100
                                          )
                                        : 0;

                                return (
                                    <div
                                        key={
                                            plan.id
                                        }
                                    >

                                        <div className="flex items-center justify-between">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                                                    {plan.name
                                                        ?.charAt(
                                                            0
                                                        )
                                                        ?.toUpperCase()}
                                                </div>

                                                <div>

                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {
                                                            plan.name
                                                        }
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        {
                                                            plan.activeCount
                                                        }{" "}
                                                        active
                                                    </p>

                                                </div>

                                            </div>

                                            <div className="text-right">

                                                <p className="text-sm font-bold text-slate-900">
                                                    {
                                                        plan.count
                                                    }
                                                </p>

                                                <p className="text-xs text-slate-400">
                                                    {
                                                        percentage
                                                    }
                                                    %
                                                </p>

                                            </div>

                                        </div>

                                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

                                            <div
                                                className="h-full rounded-full bg-slate-800 transition-all"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                </div>

                {/* REVENUE BY PLAN */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <h2 className="text-base font-bold text-slate-900">
                                Revenue by Plan
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Monthly revenue
                                contribution
                            </p>

                        </div>

                        <TrendingUp
                            size={20}
                            className="text-slate-400"
                        />

                    </div>

                    <div className="mt-6 space-y-4">

                        {revenueByPlan.map(
                            (plan) => {
                                const percentage =
                                    monthlyRevenue >
                                    0
                                        ? Math.round(
                                              (plan.revenue /
                                                  monthlyRevenue) *
                                                  100
                                          )
                                        : 0;

                                return (
                                    <div
                                        key={
                                            plan.id
                                        }
                                        className="rounded-xl border border-slate-100 p-4"
                                    >

                                        <div className="flex items-center justify-between">

                                            <div>

                                                <p className="font-semibold text-slate-800">
                                                    {
                                                        plan.name
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {
                                                        plan.activeCount
                                                    }{" "}
                                                    active
                                                    subscriptions
                                                </p>

                                            </div>

                                            <div className="text-right">

                                                <p className="font-bold text-slate-900">
                                                    ₹
                                                    {Number(
                                                        plan.revenue ||
                                                            0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </p>

                                                <p className="text-xs text-slate-400">
                                                    {
                                                        percentage
                                                    }
                                                    %
                                                </p>

                                            </div>

                                        </div>

                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

                                            <div
                                                className="h-full rounded-full bg-slate-600"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                </div>

            </div>

            {/* =================================
                RECENT SUBSCRIPTIONS
            ================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 p-6">

                    <h2 className="text-base font-bold text-slate-900">
                        Recent Subscriptions
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Latest subscription
                        activity
                    </p>

                </div>

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[800px]">

                        <thead>

                            <tr className="border-b border-slate-200 bg-slate-50">

                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                    BUSINESS
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                    PLAN
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                    AMOUNT
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                    START DATE
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                    END DATE
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                    STATUS
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {recentSubscriptions.map(
                                (
                                    subscription
                                ) => (
                                    <tr
                                        key={
                                            subscription.id
                                        }
                                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                    >

                                        <td className="px-6 py-5">

                                            <p className="font-semibold text-slate-900">
                                                {
                                                    subscription.businessName
                                                }
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                {
                                                    subscription.ownerName
                                                }
                                            </p>

                                        </td>

                                        <td className="px-6 py-5">

                                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                                                {
                                                    subscription.planName
                                                }
                                            </span>

                                        </td>

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
                                                {
                                                    subscription.billingCycle
                                                }
                                            </p>

                                        </td>

                                        <td className="px-6 py-5 text-sm text-slate-600">
                                            {
                                                subscription.startDate
                                            }
                                        </td>

                                        <td className="px-6 py-5 text-sm text-slate-600">
                                            {
                                                subscription.endDate
                                            }
                                        </td>

                                        <td className="px-6 py-5">

                                            <StatusBadge
                                                status={
                                                    subscription.status
                                                }
                                            />

                                        </td>

                                    </tr>
                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* =================================
                REPORT FOOTER
            ================================== */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                    <div>

                        <p className="text-sm font-semibold text-slate-700">
                            Report generated
                            from current
                            system data
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Refresh the page
                            after making
                            changes to users,
                            businesses, plans
                            or subscriptions.
                        </p>

                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">

                        <CheckCircle2
                            size={15}
                        />

                        Live localStorage
                        data

                    </div>

                </div>

            </div>

        </div>
    );
}

/* =========================================
   REPORT CARD
========================================= */

function ReportCard({
    title,
    value,
    subtitle,
    icon: Icon,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

                <div>

                    <p className="text-sm font-medium text-slate-400">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        {subtitle}
                    </p>

                </div>

                <div className="rounded-xl bg-slate-100 p-3">

                    <Icon
                        size={20}
                        className="text-slate-600"
                    />

                </div>

            </div>

        </div>
    );
}

/* =========================================
   STATUS BOX
========================================= */

function StatusBox({
    label,
    value,
    type = "default",
}) {
    const styles = {
        default:
            "bg-slate-50 text-slate-900",
        success:
            "bg-emerald-50 text-emerald-700",
        danger:
            "bg-red-50 text-red-700",
    };

    return (
        <div
            className={`rounded-xl p-4 ${styles[type]}`}
        >

            <p className="text-xs font-medium opacity-70">
                {label}
            </p>

            <p className="mt-1 text-xl font-bold">
                {value}
            </p>

        </div>
    );
}

/* =========================================
   SUBSCRIPTION STAT
========================================= */

function SubscriptionStat({
    label,
    value,
    type = "default",
}) {
    const styles = {
        default:
            "border-slate-100 bg-slate-50",
        success:
            "border-emerald-100 bg-emerald-50",
        danger:
            "border-red-100 bg-red-50",
        warning:
            "border-orange-100 bg-orange-50",
    };

    return (
        <div
            className={`rounded-xl border p-4 ${styles[type]}`}
        >

            <p className="text-xs text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
                {value}
            </p>

        </div>
    );
}

/* =========================================
   STATUS BADGE
========================================= */

function StatusBadge({
    status,
}) {
    const styles = {
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
                styles[status] ||
                "bg-slate-100 text-slate-600"
            }`}
        >
            {status}
        </span>
    );
}