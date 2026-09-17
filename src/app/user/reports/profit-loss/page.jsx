"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    IndianRupee,
    FileText,
    RefreshCw,
    Printer,
    CalendarDays,
} from "lucide-react";

import { STORAGE_KEYS, getStorage } from "@/lib/storage";

function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function getDate(record) {
    return (
        record?.saleDate ||
        record?.purchaseDate ||
        record?.date ||
        record?.createdAt ||
        ""
    );
}

function getSaleTotal(sale) {
    return Number(
        sale?.grandTotal ||
            sale?.total ||
            sale?.totalAmount ||
            sale?.amount ||
            sale?.netAmount ||
            0
    );
}

function getPurchaseTotal(purchase) {
    return Number(
        purchase?.grandTotal ||
            purchase?.total ||
            purchase?.totalAmount ||
            purchase?.amount ||
            purchase?.netAmount ||
            0
    );
}

function getItemCost(item) {
    return Number(
        item?.purchasePrice ||
            item?.costPrice ||
            item?.buyingPrice ||
            item?.price ||
            0
    );
}

function getItemQuantity(item) {
    return Number(item?.quantity || item?.qty || 1);
}

export default function ProfitLossReportPage() {
    const [sales, setSales] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [products, setProducts] = useState([]);

    const [dateRange, setDateRange] = useState("ALL");
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReportData();
    }, []);

    function loadReportData() {
        setLoading(true);

        const storedSales = getStorage(
            STORAGE_KEYS.SALES,
            []
        );

        const storedPurchases = getStorage(
            STORAGE_KEYS.PURCHASES,
            []
        );

        const storedProducts = getStorage(
            STORAGE_KEYS.PRODUCTS,
            []
        );

        setSales(
            Array.isArray(storedSales)
                ? storedSales
                : []
        );

        setPurchases(
            Array.isArray(storedPurchases)
                ? storedPurchases
                : []
        );

        setProducts(
            Array.isArray(storedProducts)
                ? storedProducts
                : []
        );

        setLoading(false);
    }

    function isDateInRange(dateValue) {
        if (dateRange === "ALL") {
            return true;
        }

        if (!dateValue) {
            return false;
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return false;
        }

        const now = new Date();

        if (dateRange === "TODAY") {
            return (
                date.toDateString() ===
                now.toDateString()
            );
        }

        if (dateRange === "7_DAYS") {
            const from = new Date();
            from.setDate(now.getDate() - 6);
            from.setHours(0, 0, 0, 0);

            return date >= from && date <= now;
        }

        if (dateRange === "30_DAYS") {
            const from = new Date();
            from.setDate(now.getDate() - 29);
            from.setHours(0, 0, 0, 0);

            return date >= from && date <= now;
        }

        if (dateRange === "THIS_MONTH") {
            return (
                date.getMonth() === now.getMonth() &&
                date.getFullYear() ===
                    now.getFullYear()
            );
        }

        if (dateRange === "THIS_YEAR") {
            return (
                date.getFullYear() ===
                now.getFullYear()
            );
        }

        if (dateRange === "CUSTOM") {
            const from = customFrom
                ? new Date(`${customFrom}T00:00:00`)
                : null;

            const to = customTo
                ? new Date(`${customTo}T23:59:59`)
                : null;

            if (from && date < from) {
                return false;
            }

            if (to && date > to) {
                return false;
            }

            return true;
        }

        return true;
    }

    const filteredSales = useMemo(() => {
        return sales.filter((sale) =>
            isDateInRange(getDate(sale))
        );
    }, [
        sales,
        dateRange,
        customFrom,
        customTo,
    ]);

    const filteredPurchases = useMemo(() => {
        return purchases.filter((purchase) =>
            isDateInRange(getDate(purchase))
        );
    }, [
        purchases,
        dateRange,
        customFrom,
        customTo,
    ]);

    const report = useMemo(() => {
        const totalSales = filteredSales.reduce(
            (sum, sale) =>
                sum + getSaleTotal(sale),
            0
        );

        const totalPurchases =
            filteredPurchases.reduce(
                (sum, purchase) =>
                    sum +
                    getPurchaseTotal(purchase),
                0
            );

        /*
         * Calculate Cost of Goods Sold from sales items.
         * Different sales data structures are supported.
         */
        let costOfGoodsSold = 0;

        filteredSales.forEach((sale) => {
            const items =
                sale?.items ||
                sale?.products ||
                sale?.saleItems ||
                [];

            if (Array.isArray(items)) {
                items.forEach((item) => {
                    costOfGoodsSold +=
                        getItemQuantity(item) *
                        getItemCost(item);
                });
            }
        });

        /*
         * If sale items do not contain cost price,
         * use purchase amount as fallback for demo data.
         */
        if (costOfGoodsSold === 0) {
            costOfGoodsSold = totalPurchases;
        }

        const grossProfit =
            totalSales - costOfGoodsSold;

        const grossMargin =
            totalSales > 0
                ? (grossProfit / totalSales) * 100
                : 0;

        /*
         * Demo operating expenses.
         * Can later be connected to an Expenses module.
         */
        const operatingExpenses = 0;

        const netProfit =
            grossProfit - operatingExpenses;

        const netMargin =
            totalSales > 0
                ? (netProfit / totalSales) * 100
                : 0;

        return {
            totalSales,
            totalPurchases,
            costOfGoodsSold,
            grossProfit,
            grossMargin,
            operatingExpenses,
            netProfit,
            netMargin,
        };
    }, [filteredSales, filteredPurchases]);

    const monthlyData = useMemo(() => {
        const months = {};

        filteredSales.forEach((sale) => {
            const date = getDate(sale);

            if (!date) return;

            const parsed = new Date(date);

            if (Number.isNaN(parsed.getTime())) {
                return;
            }

            const key = `${parsed.getFullYear()}-${String(
                parsed.getMonth() + 1
            ).padStart(2, "0")}`;

            if (!months[key]) {
                months[key] = {
                    month: parsed.toLocaleDateString(
                        "en-IN",
                        {
                            month: "short",
                            year: "numeric",
                        }
                    ),
                    sales: 0,
                    cost: 0,
                    profit: 0,
                };
            }

            const saleAmount =
                getSaleTotal(sale);

            let saleCost = 0;

            const items =
                sale?.items ||
                sale?.products ||
                sale?.saleItems ||
                [];

            if (Array.isArray(items)) {
                items.forEach((item) => {
                    saleCost +=
                        getItemQuantity(item) *
                        getItemCost(item);
                });
            }

            months[key].sales += saleAmount;
            months[key].cost += saleCost;
            months[key].profit +=
                saleAmount - saleCost;
        });

        return Object.entries(months)
            .sort(([a], [b]) =>
                a.localeCompare(b)
            )
            .map(([, value]) => value);
    }, [filteredSales]);

    const topProducts = useMemo(() => {
        const map = {};

        filteredSales.forEach((sale) => {
            const items =
                sale?.items ||
                sale?.products ||
                sale?.saleItems ||
                [];

            if (!Array.isArray(items)) {
                return;
            }

            items.forEach((item) => {
                const name =
                    item?.productName ||
                    item?.name ||
                    item?.product?.name ||
                    "Unknown Product";

                const quantity =
                    getItemQuantity(item);

                const price = Number(
                    item?.sellingPrice ||
                        item?.salePrice ||
                        item?.price ||
                        item?.unitPrice ||
                        0
                );

                const cost = getItemCost(item);

                if (!map[name]) {
                    map[name] = {
                        name,
                        quantity: 0,
                        sales: 0,
                        cost: 0,
                        profit: 0,
                    };
                }

                map[name].quantity += quantity;
                map[name].sales +=
                    quantity * price;
                map[name].cost +=
                    quantity * cost;
                map[name].profit +=
                    quantity * (price - cost);
            });
        });

        return Object.values(map)
            .sort(
                (a, b) =>
                    b.profit - a.profit
            )
            .slice(0, 10);
    }, [filteredSales]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-gray-500">
                    Loading Profit & Loss report...
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
                    <div>
                        <Link
                            href="/user/reports"
                            className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
                        >
                            <ArrowLeft size={16} />
                            Back to Reports
                        </Link>

                        <h1 className="text-2xl font-bold text-gray-900">
                            Profit & Loss
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Analyze revenue, cost, gross profit
                            and net profit.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={loadReportData}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            <RefreshCw size={17} />
                            Refresh
                        </button>

                        <button
                            onClick={() =>
                                window.print()
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                        >
                            <Printer size={17} />
                            Print / PDF
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm print:hidden">
                    <div className="mb-4 flex items-center gap-2">
                        <CalendarDays
                            size={18}
                            className="text-gray-500"
                        />

                        <h2 className="font-semibold text-gray-900">
                            Report Period
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <select
                            value={dateRange}
                            onChange={(e) =>
                                setDateRange(
                                    e.target.value
                                )
                            }
                            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                        >
                            <option value="ALL">
                                All Time
                            </option>

                            <option value="TODAY">
                                Today
                            </option>

                            <option value="7_DAYS">
                                Last 7 Days
                            </option>

                            <option value="30_DAYS">
                                Last 30 Days
                            </option>

                            <option value="THIS_MONTH">
                                This Month
                            </option>

                            <option value="THIS_YEAR">
                                This Year
                            </option>

                            <option value="CUSTOM">
                                Custom Range
                            </option>
                        </select>

                        {dateRange === "CUSTOM" && (
                            <>
                                <input
                                    type="date"
                                    value={customFrom}
                                    onChange={(e) =>
                                        setCustomFrom(
                                            e.target.value
                                        )
                                    }
                                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                                />

                                <input
                                    type="date"
                                    value={customTo}
                                    onChange={(e) =>
                                        setCustomTo(
                                            e.target.value
                                        )
                                    }
                                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* Main KPI Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {/* Revenue */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Total Revenue
                                </p>

                                <h3 className="mt-1 text-2xl font-bold text-gray-900">
                                    {formatCurrency(
                                        report.totalSales
                                    )}
                                </h3>
                            </div>

                            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                                <TrendingUp
                                    size={22}
                                />
                            </div>
                        </div>
                    </div>

                    {/* COGS */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Cost of Goods Sold
                                </p>

                                <h3 className="mt-1 text-2xl font-bold text-gray-900">
                                    {formatCurrency(
                                        report.costOfGoodsSold
                                    )}
                                </h3>
                            </div>

                            <div className="rounded-xl bg-red-50 p-3 text-red-600">
                                <TrendingDown
                                    size={22}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Gross Profit */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Gross Profit
                                </p>

                                <h3
                                    className={`mt-1 text-2xl font-bold ${
                                        report.grossProfit >=
                                        0
                                            ? "text-emerald-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {formatCurrency(
                                        report.grossProfit
                                    )}
                                </h3>
                            </div>

                            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                                <IndianRupee
                                    size={22}
                                />
                            </div>
                        </div>

                        <p className="mt-2 text-xs text-gray-500">
                            Margin:{" "}
                            {report.grossMargin.toFixed(
                                2
                            )}
                            %
                        </p>
                    </div>

                    {/* Net Profit */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Net Profit
                                </p>

                                <h3
                                    className={`mt-1 text-2xl font-bold ${
                                        report.netProfit >=
                                        0
                                            ? "text-emerald-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {formatCurrency(
                                        report.netProfit
                                    )}
                                </h3>
                            </div>

                            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                                <IndianRupee
                                    size={22}
                                />
                            </div>
                        </div>

                        <p className="mt-2 text-xs text-gray-500">
                            Margin:{" "}
                            {report.netMargin.toFixed(
                                2
                            )}
                            %
                        </p>
                    </div>
                </div>

                {/* P&L Summary */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="rounded-xl bg-gray-100 p-3 text-gray-700">
                                <FileText size={20} />
                            </div>

                            <div>
                                <h2 className="font-bold text-gray-900">
                                    Profit & Loss Summary
                                </h2>

                                <p className="text-xs text-gray-500">
                                    Financial overview
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <span className="text-sm text-gray-500">
                                    Sales Revenue
                                </span>

                                <span className="font-semibold text-gray-900">
                                    {formatCurrency(
                                        report.totalSales
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <span className="text-sm text-gray-500">
                                    Cost of Goods Sold
                                </span>

                                <span className="font-semibold text-red-600">
                                    -{" "}
                                    {formatCurrency(
                                        report.costOfGoodsSold
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <span className="text-sm font-semibold text-gray-700">
                                    Gross Profit
                                </span>

                                <span
                                    className={`font-bold ${
                                        report.grossProfit >=
                                        0
                                            ? "text-emerald-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {formatCurrency(
                                        report.grossProfit
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <span className="text-sm text-gray-500">
                                    Operating Expenses
                                </span>

                                <span className="font-semibold text-gray-900">
                                    {formatCurrency(
                                        report.operatingExpenses
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                                <span className="font-bold text-gray-900">
                                    Net Profit
                                </span>

                                <span
                                    className={`text-xl font-bold ${
                                        report.netProfit >=
                                        0
                                            ? "text-emerald-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {formatCurrency(
                                        report.netProfit
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Financial Metrics */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="font-bold text-gray-900">
                            Financial Metrics
                        </h2>

                        <div className="mt-5 grid grid-cols-2 gap-4">
                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <p className="text-xs text-gray-500">
                                    Gross Margin
                                </p>

                                <p className="mt-1 text-xl font-bold text-gray-900">
                                    {report.grossMargin.toFixed(
                                        2
                                    )}
                                    %
                                </p>
                            </div>

                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <p className="text-xs text-gray-500">
                                    Net Margin
                                </p>

                                <p className="mt-1 text-xl font-bold text-gray-900">
                                    {report.netMargin.toFixed(
                                        2
                                    )}
                                    %
                                </p>
                            </div>

                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <p className="text-xs text-gray-500">
                                    Sales Transactions
                                </p>

                                <p className="mt-1 text-xl font-bold text-gray-900">
                                    {filteredSales.length}
                                </p>
                            </div>

                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <p className="text-xs text-gray-500">
                                    Purchase Transactions
                                </p>

                                <p className="mt-1 text-xl font-bold text-gray-900">
                                    {
                                        filteredPurchases.length
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Total Purchase Value
                                </span>

                                <span className="font-bold text-gray-900">
                                    {formatCurrency(
                                        report.totalPurchases
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="mt-3 rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Products in Inventory
                                </span>

                                <span className="font-bold text-gray-900">
                                    {products.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Performance */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-5">
                        <h2 className="font-bold text-gray-900">
                            Monthly Performance
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                            Revenue and profit generated from
                            sales.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Month
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Revenue
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Cost
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Profit
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Margin
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {monthlyData.length > 0 ? (
                                    monthlyData.map(
                                        (item) => {
                                            const margin =
                                                item.sales >
                                                0
                                                    ? (item.profit /
                                                          item.sales) *
                                                      100
                                                    : 0;

                                            return (
                                                <tr
                                                    key={
                                                        item.month
                                                    }
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                                                        {
                                                            item.month
                                                        }
                                                    </td>

                                                    <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900">
                                                        {formatCurrency(
                                                            item.sales
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-right text-sm text-red-600">
                                                        {formatCurrency(
                                                            item.cost
                                                        )}
                                                    </td>

                                                    <td
                                                        className={`px-5 py-4 text-right text-sm font-bold ${
                                                            item.profit >=
                                                            0
                                                                ? "text-emerald-600"
                                                                : "text-red-600"
                                                        }`}
                                                    >
                                                        {formatCurrency(
                                                            item.profit
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4 text-right text-sm text-gray-700">
                                                        {margin.toFixed(
                                                            2
                                                        )}
                                                        %
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-5 py-12 text-center text-sm text-gray-500"
                                        >
                                            No sales data available
                                            for the selected
                                            period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Profitable Products */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 p-5">
                        <h2 className="font-bold text-gray-900">
                            Product Profitability
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                            Products sorted by generated profit.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Product
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Quantity
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Sales
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Cost
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Profit
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {topProducts.length > 0 ? (
                                    topProducts.map(
                                        (product) => (
                                            <tr
                                                key={
                                                    product.name
                                                }
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-600">
                                                            {product.name
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </div>

                                                        <span className="font-medium text-gray-900">
                                                            {
                                                                product.name
                                                            }
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-right text-sm text-gray-600">
                                                    {
                                                        product.quantity
                                                    }
                                                </td>

                                                <td className="px-5 py-4 text-right text-sm font-medium text-gray-900">
                                                    {formatCurrency(
                                                        product.sales
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-right text-sm text-red-600">
                                                    {formatCurrency(
                                                        product.cost
                                                    )}
                                                </td>

                                                <td
                                                    className={`px-5 py-4 text-right text-sm font-bold ${
                                                        product.profit >=
                                                        0
                                                            ? "text-emerald-600"
                                                            : "text-red-600"
                                                    }`}
                                                >
                                                    {formatCurrency(
                                                        product.profit
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-5 py-12 text-center text-sm text-gray-500"
                                        >
                                            No product-level sales
                                            data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Report Note */}
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-800">
                    <p className="font-semibold">
                        Profit & Loss Calculation
                    </p>

                    <p className="mt-1 leading-6">
                        Gross Profit = Sales Revenue − Cost of
                        Goods Sold. Net Profit = Gross Profit −
                        Operating Expenses. Currently operating
                        expenses are ₹0 because an Expenses module
                        is not yet connected.
                    </p>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body {
                        background: white !important;
                    }

                    aside,
                    nav,
                    header,
                    .print\\:hidden {
                        display: none !important;
                    }

                    #invoice-print {
                        box-shadow: none !important;
                    }

                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                }
            `}</style>
        </>
    );
}