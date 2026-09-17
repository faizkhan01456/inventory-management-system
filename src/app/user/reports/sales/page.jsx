"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Search,
    TrendingUp,
    ShoppingCart,
    IndianRupee,
    Calendar,
    Printer,
    RefreshCw,
} from "lucide-react";

import { STORAGE_KEYS, getStorage } from "@/lib/storage";

function money(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;
}

function getTotal(sale) {
    return Number(
        sale.grandTotal ||
            sale.total ||
            sale.totalAmount ||
            sale.amount ||
            0
    );
}

function getDate(sale) {
    return (
        sale.saleDate ||
        sale.date ||
        sale.createdAt ||
        ""
    );
}

export default function SalesReportPage() {
    const [sales, setSales] = useState([]);
    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    function loadData() {
        const data = getStorage(STORAGE_KEYS.SALES, []);
        setSales(Array.isArray(data) ? data : []);
    }

    useEffect(() => {
        loadData();
    }, []);

    const filteredSales = useMemo(() => {
        const query = search.toLowerCase().trim();

        return sales.filter((sale) => {
            const customer =
                sale.customerName ||
                sale.customer?.name ||
                "";

            const invoice =
                sale.invoiceNumber ||
                sale.invoiceNo ||
                sale.number ||
                sale.id ||
                "";

            const date = getDate(sale)
                ? String(getDate(sale)).slice(0, 10)
                : "";

            const matchesSearch =
                !query ||
                String(customer)
                    .toLowerCase()
                    .includes(query) ||
                String(invoice)
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
    }, [sales, search, fromDate, toDate]);

    const totalRevenue = filteredSales.reduce(
        (sum, sale) => sum + getTotal(sale),
        0
    );

    const averageSale =
        filteredSales.length > 0
            ? totalRevenue / filteredSales.length
            : 0;

    function printReport() {
        window.print();
    }

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
                        Sales Report
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Analyze sales transactions and revenue.
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
                        onClick={printReport}
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
                    value={filteredSales.length}
                    icon={ShoppingCart}
                />

                <StatCard
                    title="Total Revenue"
                    value={money(totalRevenue)}
                    icon={IndianRupee}
                />

                <StatCard
                    title="Average Sale"
                    value={money(averageSale)}
                    icon={TrendingUp}
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
                            placeholder="Search customer or invoice..."
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
                                    Invoice / Sale
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                    Customer
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                    Date
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                    Payment
                                </th>

                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                                    Amount
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {filteredSales.length > 0 ? (
                                filteredSales.map(
                                    (sale, index) => {
                                        const customer =
                                            sale.customerName ||
                                            sale.customer?.name ||
                                            "Walk-in Customer";

                                        const invoice =
                                            sale.invoiceNumber ||
                                            sale.invoiceNo ||
                                            sale.number ||
                                            `SALE-${String(
                                                index + 1
                                            ).padStart(4, "0")}`;

                                        const payment =
                                            sale.paymentStatus ||
                                            sale.paymentMethod ||
                                            "N/A";

                                        return (
                                            <tr
                                                key={
                                                    sale.id ||
                                                    index
                                                }
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-gray-900">
                                                        {invoice}
                                                    </p>

                                                    <p className="text-xs text-gray-400">
                                                        Sale
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-700">
                                                    {customer}
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-600">
                                                    {getDate(
                                                        sale
                                                    )
                                                        ? String(
                                                              getDate(
                                                                  sale
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
                                                            payment
                                                        ).toUpperCase()}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-right font-semibold text-gray-900">
                                                    {money(
                                                        getTotal(
                                                            sale
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
                                        No sales found.
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