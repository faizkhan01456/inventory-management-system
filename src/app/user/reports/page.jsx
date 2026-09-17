"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    BarChart3,
    ShoppingCart,
    Package,
    TrendingUp,
    TrendingDown,
    IndianRupee,
    FileText,
    ArrowRight,
    RefreshCw,
} from "lucide-react";

import { STORAGE_KEYS, getStorage } from "@/lib/storage";

function money(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;
}

function getSaleTotal(sale) {
    return Number(
        sale.grandTotal ||
            sale.total ||
            sale.totalAmount ||
            sale.amount ||
            0
    );
}

function getPurchaseTotal(purchase) {
    return Number(
        purchase.grandTotal ||
            purchase.total ||
            purchase.totalAmount ||
            purchase.amount ||
            0
    );
}

export default function ReportsPage() {
    const [sales, setSales] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [products, setProducts] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    function loadReports() {
        setSales(
            getStorage(STORAGE_KEYS.SALES, []) || []
        );

        setPurchases(
            getStorage(STORAGE_KEYS.PURCHASES, []) || []
        );

        setProducts(
            getStorage(STORAGE_KEYS.PRODUCTS, []) || []
        );

        setInvoices(
            getStorage("inventory_invoices", []) || []
        );

        setLoading(false);
    }

    useEffect(() => {
        loadReports();
    }, []);

    const stats = useMemo(() => {
        const totalSales = sales.reduce(
            (sum, sale) => sum + getSaleTotal(sale),
            0
        );

        const totalPurchases = purchases.reduce(
            (sum, purchase) =>
                sum + getPurchaseTotal(purchase),
            0
        );

        const stockUnits = products.reduce(
            (sum, product) =>
                sum +
                Number(
                    product.stock ||
                        product.quantity ||
                        product.currentStock ||
                        0
                ),
            0
        );

        const stockValue = products.reduce(
            (sum, product) => {
                const stock = Number(
                    product.stock ||
                        product.quantity ||
                        product.currentStock ||
                        0
                );

                const cost = Number(
                    product.purchasePrice ||
                        product.costPrice ||
                        product.buyingPrice ||
                        product.price ||
                        0
                );

                return sum + stock * cost;
            },
            0
        );

        const grossProfit = totalSales - totalPurchases;

        return {
            totalSales,
            totalPurchases,
            stockUnits,
            stockValue,
            grossProfit,
            invoices: invoices.length,
        };
    }, [sales, purchases, products, invoices]);

    const cards = [
        {
            title: "Total Sales",
            value: money(stats.totalSales),
            description: `${sales.length} sales recorded`,
            icon: TrendingUp,
            href: "/user/reports/sales",
        },
        {
            title: "Total Purchases",
            value: money(stats.totalPurchases),
            description: `${purchases.length} purchases recorded`,
            icon: TrendingDown,
            href: "/user/reports/purchases",
        },
        {
            title: "Stock Units",
            value: stats.stockUnits.toLocaleString("en-IN"),
            description: "Current inventory units",
            icon: Package,
            href: "/user/reports/inventory",
        },
        {
            title: "Stock Value",
            value: money(stats.stockValue),
            description: "Based on purchase cost",
            icon: IndianRupee,
            href: "/user/reports/inventory",
        },
        {
            title: "Gross Profit",
            value: money(stats.grossProfit),
            description: "Sales minus purchases",
            icon: BarChart3,
            href: "/user/reports/profit-loss",
        },
    ];

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center text-sm text-gray-500">
                Loading reports...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Reports
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Analyze your sales, purchases, inventory and
                        profitability.
                    </p>
                </div>

                <button
                    onClick={loadReports}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <Link
                            href={card.href}
                            key={card.title}
                            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        {card.title}
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold text-gray-900">
                                        {card.value}
                                    </h2>
                                </div>

                                <div className="rounded-xl bg-gray-100 p-3 text-gray-700">
                                    <Icon size={21} />
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-xs text-gray-400">
                                    {card.description}
                                </p>

                                <ArrowRight
                                    size={15}
                                    className="text-gray-400 transition group-hover:translate-x-1"
                                />
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Report Modules */}
            <div>
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                    Detailed Reports
                </h2>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <ReportCard
                        href="/user/reports/sales"
                        icon={TrendingUp}
                        title="Sales Report"
                        description="View sales transactions, revenue, customers and sales trends."
                        value={`${sales.length} transactions`}
                    />

                    <ReportCard
                        href="/user/reports/purchases"
                        icon={ShoppingCart}
                        title="Purchase Report"
                        description="Analyze supplier purchases, purchase amounts and transaction history."
                        value={`${purchases.length} transactions`}
                    />

                    <ReportCard
                        href="/user/reports/inventory"
                        icon={Package}
                        title="Inventory Report"
                        description="Check stock levels, stock value, low-stock products and inventory worth."
                        value={`${products.length} products`}
                    />

                    <ReportCard
                        href="/user/reports/profit-loss"
                        icon={BarChart3}
                        title="Profit & Loss"
                        description="Compare sales and purchase costs to understand your gross profitability."
                        value={money(stats.grossProfit)}
                    />
                </div>
            </div>

            {/* Quick Summary */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">
                    Business Summary
                </h2>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
                    <SummaryItem
                        label="Sales Revenue"
                        value={money(stats.totalSales)}
                    />

                    <SummaryItem
                        label="Purchase Cost"
                        value={money(stats.totalPurchases)}
                    />

                    <SummaryItem
                        label="Invoices"
                        value={stats.invoices}
                    />
                </div>
            </div>
        </div>
    );
}

function ReportCard({
    href,
    icon: Icon,
    title,
    description,
    value,
}) {
    return (
        <Link
            href={href}
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-gray-300 hover:shadow-md"
        >
            <div className="flex items-start justify-between">
                <div className="rounded-xl bg-gray-100 p-3 text-gray-700">
                    <Icon size={24} />
                </div>

                <ArrowRight
                    size={19}
                    className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-900"
                />
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-900">
                {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
                {description}
            </p>

            <div className="mt-5 border-t border-gray-100 pt-4">
                <span className="text-sm font-semibold text-gray-700">
                    {value}
                </span>
            </div>
        </Link>
    );
}

function SummaryItem({ label, value }) {
    return (
        <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
                {label}
            </p>

            <p className="mt-1 text-xl font-bold text-gray-900">
                {typeof value === "number"
                    ? value.toLocaleString("en-IN")
                    : value}
            </p>
        </div>
    );
}