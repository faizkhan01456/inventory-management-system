"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ShoppingCart,
    Plus,
    Search,
    RefreshCw,
    Eye,
    FileText,
    Package,
    IndianRupee,
    Clock3,
    CheckCircle2,
    XCircle,
    Truck,
} from "lucide-react";

import {
    getStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        loadPurchases();
    }, []);

    const loadPurchases = () => {
        setLoading(true);

        const data = getStorage(
            STORAGE_KEYS.PURCHASES,
            []
        );

        setPurchases(
            Array.isArray(data) ? data : []
        );

        setLoading(false);
    };

    const filteredPurchases = useMemo(() => {
        return purchases.filter((purchase) => {
            const query = search
                .trim()
                .toLowerCase();

            const purchaseNumber =
                purchase.purchaseNumber ||
                purchase.invoiceNumber ||
                purchase.id ||
                "";

            const supplierName =
                purchase.supplierName || "";

            const matchesSearch =
                !query ||
                String(purchaseNumber)
                    .toLowerCase()
                    .includes(query) ||
                String(supplierName)
                    .toLowerCase()
                    .includes(query);

            const status = String(
                purchase.status || "PENDING"
            ).toUpperCase();

            const matchesStatus =
                statusFilter === "ALL" ||
                status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        purchases,
        search,
        statusFilter,
    ]);

    const totalPurchases = purchases.length;

    const completedPurchases =
        purchases.filter(
            (purchase) =>
                String(
                    purchase.status || ""
                ).toUpperCase() ===
                "COMPLETED"
        ).length;

    const pendingPurchases =
        purchases.filter(
            (purchase) =>
                String(
                    purchase.status || ""
                ).toUpperCase() ===
                "PENDING"
        ).length;

    const totalPurchaseAmount =
        purchases.reduce(
            (total, purchase) =>
                total +
                Number(
                    purchase.grandTotal ??
                        purchase.totalAmount ??
                        purchase.total ??
                        0
                ),
            0
        );

    const formatCurrency = (amount) => {
        return `₹${Number(
            amount || 0
        ).toLocaleString("en-IN")}`;
    };

    const formatDate = (date) => {
        if (!date) return "—";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return String(date);
        }

        return parsed.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <RefreshCw
                        size={28}
                        className="mx-auto animate-spin text-slate-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading purchases...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* HEADER */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>
                    <div className="flex items-center gap-2">
                        <ShoppingCart
                            size={25}
                            className="text-slate-700"
                        />

                        <h1 className="text-2xl font-bold text-slate-900">
                            Purchases
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage supplier purchases
                        and incoming stock.
                    </p>
                </div>

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={loadPurchases}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>

                    <Link
                        href="/user/purchases/new"
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        <Plus size={17} />
                        New Purchase
                    </Link>

                </div>
            </div>

            {/* STATS */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <PurchaseStat
                    title="Total Purchases"
                    value={totalPurchases}
                    subtitle="All purchase orders"
                    icon={ShoppingCart}
                />

                <PurchaseStat
                    title="Completed"
                    value={completedPurchases}
                    subtitle="Completed purchases"
                    icon={CheckCircle2}
                />

                <PurchaseStat
                    title="Pending"
                    value={pendingPurchases}
                    subtitle="Pending purchases"
                    icon={Clock3}
                />

                <PurchaseStat
                    title="Purchase Value"
                    value={formatCurrency(
                        totalPurchaseAmount
                    )}
                    subtitle="Total purchase amount"
                    icon={IndianRupee}
                />

            </div>

            {/* FILTERS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="flex flex-col gap-3 md:flex-row">

                    <div className="relative flex-1">

                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search purchase number or supplier..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white"
                        />

                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                    >
                        <option value="ALL">
                            All Status
                        </option>

                        <option value="COMPLETED">
                            Completed
                        </option>

                        <option value="PENDING">
                            Pending
                        </option>

                        <option value="CANCELLED">
                            Cancelled
                        </option>
                    </select>

                </div>
            </div>

            {/* TABLE */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                    <h2 className="text-base font-bold text-slate-900">
                        Purchase History
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Showing{" "}
                        {filteredPurchases.length}{" "}
                        of{" "}
                        {purchases.length}
                        {" "}purchases
                    </p>

                </div>

                {filteredPurchases.length === 0 ? (
                    <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                            <ShoppingCart
                                size={28}
                                className="text-slate-400"
                            />
                        </div>

                        <h3 className="mt-4 text-base font-bold text-slate-800">
                            No purchases found
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                            Create your first
                            purchase to start
                            tracking inventory.
                        </p>

                        <Link
                            href="/user/purchases/new"
                            className="mt-5 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            <Plus size={16} />
                            New Purchase
                        </Link>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1100px]">

                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        PURCHASE
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        SUPPLIER
                                    </th>

                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500">
                                        ITEMS
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        TOTAL
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        PAYMENT
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        STATUS
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        DATE
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        ACTION
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {filteredPurchases.map(
                                    (purchase) => {

                                        const items =
                                            purchase.items ||
                                            purchase.products ||
                                            [];

                                        const total =
                                            Number(
                                                purchase.grandTotal ??
                                                    purchase.totalAmount ??
                                                    purchase.total ??
                                                    0
                                            );

                                        return (
                                            <tr
                                                key={
                                                    purchase.id
                                                }
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                            >

                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                                                            <FileText
                                                                size={18}
                                                                className="text-slate-600"
                                                            />
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">
                                                                {
                                                                    purchase.purchaseNumber ||
                                                                    purchase.invoiceNumber ||
                                                                    purchase.id
                                                                }
                                                            </p>

                                                            <p className="text-xs text-slate-400">
                                                                Purchase
                                                            </p>
                                                        </div>

                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <Truck
                                                            size={16}
                                                            className="text-slate-400"
                                                        />

                                                        <span className="text-sm font-semibold text-slate-700">
                                                            {
                                                                purchase.supplierName ||
                                                                "Unknown Supplier"
                                                            }
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5 text-center">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                                                        <Package
                                                            size={13}
                                                        />

                                                        {Array.isArray(
                                                            items
                                                        )
                                                            ? items.length
                                                            : 0}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5 text-right">
                                                    <span className="text-sm font-bold text-slate-900">
                                                        {formatCurrency(
                                                            total
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span className="text-sm text-slate-600">
                                                        {
                                                            purchase.paymentMethod ||
                                                            purchase.paymentStatus ||
                                                            "—"
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <PurchaseStatus
                                                        status={
                                                            purchase.status
                                                        }
                                                    />
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span className="whitespace-nowrap text-sm text-slate-500">
                                                        {formatDate(
                                                            purchase.purchaseDate ||
                                                                purchase.date ||
                                                                purchase.createdAt
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex justify-end">

                                                        <Link
                                                            href={`/user/purchases/${purchase.id}`}
                                                            className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                                            title="View Purchase"
                                                        >
                                                            <Eye size={18} />
                                                        </Link>

                                                    </div>
                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

        </div>
    );
}

function PurchaseStat({
    title,
    value,
    subtitle,
    icon: Icon,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

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

                <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                    <Icon size={20} />
                </div>

            </div>

        </div>
    );
}

function PurchaseStatus({
    status,
}) {
    const normalized =
        String(
            status || "PENDING"
        ).toUpperCase();

    if (normalized === "COMPLETED") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
                <CheckCircle2 size={13} />
                COMPLETED
            </span>
        );
    }

    if (normalized === "CANCELLED") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
                <XCircle size={13} />
                CANCELLED
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600">
            <Clock3 size={13} />
            PENDING
        </span>
    );
}