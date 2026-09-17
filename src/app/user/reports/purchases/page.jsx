"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Search,
    ShoppingCart,
    IndianRupee,
    Calendar,
    TrendingDown,
    Printer,
    RefreshCw,
} from "lucide-react";

import { STORAGE_KEYS, getStorage } from "@/lib/storage";

function money(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;
}

function getTotal(purchase) {
    return Number(
        purchase.grandTotal ||
            purchase.total ||
            purchase.totalAmount ||
            purchase.amount ||
            0
    );
}

function getDate(purchase) {
    return (
        purchase.purchaseDate ||
        purchase.date ||
        purchase.createdAt ||
        ""
    );
}

export default function PurchasesReportPage() {
    const [purchases, setPurchases] = useState([]);
    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    function loadData() {
        const data = getStorage(
            STORAGE_KEYS.PURCHASES,
            []
        );

        setPurchases(Array.isArray(data) ? data : []);
    }

    useEffect(() => {
        loadData();
    }, []);

    const filteredPurchases = useMemo(() => {
        const query = search.toLowerCase().trim();

        return purchases.filter((purchase) => {
            const supplier =
                purchase.supplierName ||
                purchase.supplier?.name ||
                "";

            const purchaseNumber =
                purchase.purchaseNumber ||
                purchase.purchaseNo ||
                purchase.number ||
                purchase.id ||
                "";

            const date = getDate(purchase)
                ? String(getDate(purchase)).slice(0, 10)
                : "";

            const matchesSearch =
                !query ||
                String(supplier)
                    .toLowerCase()
                    .includes(query) ||
                String(purchaseNumber)
                    .toLowerCase()
                    .includes(query);

            const matchesFrom =
                !fromDate || date >= fromDate;

            const matchesTo =
                !toDate || date <= toDate;

            return (
                matchesSearch &&
                matchesFrom &&
                matchesTo
            );
        });
    }, [
        purchases,
        search,
        fromDate,
        toDate,
    ]);

    const totalPurchases = filteredPurchases.reduce(
        (sum, purchase) =>
            sum + getTotal(purchase),
        0
    );

    const averagePurchase =
        filteredPurchases.length
            ? totalPurchases /
              filteredPurchases.length
            : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
                <div>
                    <Link
                        href="/user/reports"
                        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
                    >
                        <ArrowLeft size={16} />
                        Back to Reports
                    </Link>

                    <h1 className="text-2xl font-bold text-gray-900">
                        Purchase Report
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Analyze supplier purchases and purchase costs.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={loadData}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <Printer size={17} />
                        Print
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard
                    title="Transactions"
                    value={filteredPurchases.length}
                    icon={ShoppingCart}
                />

                <StatCard
                    title="Total Purchases"
                    value={money(totalPurchases)}
                    icon={TrendingDown}
                />

                <StatCard
                    title="Average Purchase"
                    value={money(averagePurchase)}
                    icon={IndianRupee}
                />
            </div>

            {/* Filters */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm print:hidden">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div className="relative md:col-span-2">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search supplier or purchase..."
                            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none"
                        />
                    </div>

                    <div className="relative">
                        <Calendar
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) =>
                                setFromDate(e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none"
                        />
                    </div>

                    <div className="relative">
                        <Calendar
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) =>
                                setToDate(e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-[850px] w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                    Purchase
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                    Supplier
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                    Date
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                    Status
                                </th>

                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                                    Amount
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {filteredPurchases.length ? (
                                filteredPurchases.map(
                                    (purchase, index) => {
                                        const supplier =
                                            purchase.supplierName ||
                                            purchase.supplier?.name ||
                                            "Supplier";

                                        const number =
                                            purchase.purchaseNumber ||
                                            purchase.purchaseNo ||
                                            purchase.number ||
                                            `PUR-${String(
                                                index + 1
                                            ).padStart(4, "0")}`;

                                        return (
                                            <tr
                                                key={
                                                    purchase.id ||
                                                    index
                                                }
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-gray-900">
                                                        {number}
                                                    </p>

                                                    <p className="text-xs text-gray-400">
                                                        Purchase
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-700">
                                                    {supplier}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-600">
                                                    {getDate(
                                                        purchase
                                                    )
                                                        ? String(
                                                              getDate(
                                                                  purchase
                                                              )
                                                          ).slice(
                                                              0,
                                                              10
                                                          )
                                                        : "-"}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                                        {String(
                                                            purchase.status ||
                                                                "COMPLETED"
                                                        ).toUpperCase()}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-right font-semibold text-gray-900">
                                                    {money(
                                                        getTotal(
                                                            purchase
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    }
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-5 py-16 text-center text-sm text-gray-500"
                                    >
                                        No purchases found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    .print\\:hidden {
                        display: none !important;
                    }

                    body {
                        background: white !important;
                    }
                }
            `}</style>
        </div>
    );
}

function StatCard({ title, value, icon: Icon }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">
                        {title}
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-gray-900">
                        {typeof value === "number"
                            ? value.toLocaleString("en-IN")
                            : value}
                    </h2>
                </div>

                <div className="rounded-xl bg-gray-100 p-3 text-gray-700">
                    <Icon size={21} />
                </div>
            </div>
        </div>
    );
}