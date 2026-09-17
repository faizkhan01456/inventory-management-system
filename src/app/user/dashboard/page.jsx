"use client";

import { useEffect, useMemo, useState } from "react";

import {
    Package,
    ShoppingCart,
    ShoppingBag,
    Users,
    Truck,
    AlertTriangle,
    IndianRupee,
    TrendingUp,
    Plus,
    ArrowRight,
    RefreshCw,
} from "lucide-react";

import {
    getStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

import { useAuth } from "@/context/AuthContext";

import {
    products as demoProducts,
    sales as demoSales,
    purchases as demoPurchases,
    customers as demoCustomers,
    suppliers as demoSuppliers,
} from "@/data/demoData";

export default function UserDashboardPage() {
    const { user } = useAuth();

    const [products, setProducts] =
        useState([]);

    const [sales, setSales] =
        useState([]);

    const [purchases, setPurchases] =
        useState([]);

    const [customers, setCustomers] =
        useState([]);

    const [suppliers, setSuppliers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    /*
     * =========================================
     * LOAD DASHBOARD DATA
     * =========================================
     */

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = () => {
        setLoading(true);

        const storedProducts =
            getStorage(
                STORAGE_KEYS.PRODUCTS,
                demoProducts
            );

        const storedSales =
            getStorage(
                STORAGE_KEYS.SALES,
                demoSales
            );

        const storedPurchases =
            getStorage(
                STORAGE_KEYS.PURCHASES,
                demoPurchases
            );

        const storedCustomers =
            getStorage(
                STORAGE_KEYS.CUSTOMERS,
                demoCustomers
            );

        const storedSuppliers =
            getStorage(
                STORAGE_KEYS.SUPPLIERS,
                demoSuppliers
            );

        setProducts(
            Array.isArray(
                storedProducts
            )
                ? storedProducts
                : demoProducts
        );

        setSales(
            Array.isArray(storedSales)
                ? storedSales
                : demoSales
        );

        setPurchases(
            Array.isArray(
                storedPurchases
            )
                ? storedPurchases
                : demoPurchases
        );

        setCustomers(
            Array.isArray(
                storedCustomers
            )
                ? storedCustomers
                : demoCustomers
        );

        setSuppliers(
            Array.isArray(
                storedSuppliers
            )
                ? storedSuppliers
                : demoSuppliers
        );

        setLoading(false);
    };

    /*
     * =========================================
     * CURRENT BUSINESS
     * =========================================
     */

    const businessId =
        user?.businessId;

    /*
     * =========================================
     * BUSINESS PRODUCTS
     * =========================================
     */

    const businessProducts =
        useMemo(() => {
            if (!businessId) {
                return products;
            }

            const hasBusinessData =
                products.some(
                    (item) =>
                        item.businessId
                );

            if (!hasBusinessData) {
                return products;
            }

            return products.filter(
                (item) =>
                    item.businessId ===
                    businessId
            );
        }, [
            products,
            businessId,
        ]);

    /*
     * =========================================
     * BUSINESS SALES
     * =========================================
     */

    const businessSales =
        useMemo(() => {
            if (!businessId) {
                return sales;
            }

            const hasBusinessData =
                sales.some(
                    (item) =>
                        item.businessId
                );

            if (!hasBusinessData) {
                return sales;
            }

            return sales.filter(
                (item) =>
                    item.businessId ===
                    businessId
            );
        }, [
            sales,
            businessId,
        ]);

    /*
     * =========================================
     * BUSINESS PURCHASES
     * =========================================
     */

    const businessPurchases =
        useMemo(() => {
            if (!businessId) {
                return purchases;
            }

            const hasBusinessData =
                purchases.some(
                    (item) =>
                        item.businessId
                );

            if (!hasBusinessData) {
                return purchases;
            }

            return purchases.filter(
                (item) =>
                    item.businessId ===
                    businessId
            );
        }, [
            purchases,
            businessId,
        ]);

    /*
     * =========================================
     * BUSINESS CUSTOMERS
     * =========================================
     */

    const businessCustomers =
        useMemo(() => {
            if (!businessId) {
                return customers;
            }

            const hasBusinessData =
                customers.some(
                    (item) =>
                        item.businessId
                );

            if (!hasBusinessData) {
                return customers;
            }

            return customers.filter(
                (item) =>
                    item.businessId ===
                    businessId
            );
        }, [
            customers,
            businessId,
        ]);

    /*
     * =========================================
     * BUSINESS SUPPLIERS
     * =========================================
     */

    const businessSuppliers =
        useMemo(() => {
            if (!businessId) {
                return suppliers;
            }

            const hasBusinessData =
                suppliers.some(
                    (item) =>
                        item.businessId
                );

            if (!hasBusinessData) {
                return suppliers;
            }

            return suppliers.filter(
                (item) =>
                    item.businessId ===
                    businessId
            );
        }, [
            suppliers,
            businessId,
        ]);

    /*
     * =========================================
     * PRODUCT STATS
     * =========================================
     */

    const totalProducts =
        businessProducts.length;

    const totalStock =
        businessProducts.reduce(
            (total, product) =>
                total +
                Number(
                    product.stock ??
                        product.quantity ??
                        0
                ),
            0
        );

    const lowStockProducts =
        businessProducts.filter(
            (product) => {
                const stock =
                    Number(
                        product.stock ??
                            product.quantity ??
                            0
                    );

                const minimum =
                    Number(
                        product.minStock ??
                            product.lowStockThreshold ??
                            10
                    );

                return stock <= minimum;
            }
        );

    /*
     * =========================================
     * SALES STATS
     * =========================================
     */

    const totalSalesAmount =
        businessSales.reduce(
            (total, sale) =>
                total +
                Number(
                    sale.total ??
                        sale.totalAmount ??
                        sale.grandTotal ??
                        sale.amount ??
                        0
                ),
            0
        );

    const today = new Date();

    const todayString =
        today
            .toISOString()
            .split("T")[0];

    const todaySales =
        businessSales.filter(
            (sale) => {
                const saleDate =
                    sale.date ??
                    sale.saleDate ??
                    sale.createdAt;

                if (!saleDate) {
                    return false;
                }

                return (
                    String(
                        saleDate
                    ).split(
                        "T"
                    )[0] ===
                    todayString
                );
            }
        );

    const todaySalesAmount =
        todaySales.reduce(
            (total, sale) =>
                total +
                Number(
                    sale.total ??
                        sale.totalAmount ??
                        sale.grandTotal ??
                        sale.amount ??
                        0
                ),
            0
        );

    /*
     * =========================================
     * PURCHASE STATS
     * =========================================
     */

    const totalPurchaseAmount =
        businessPurchases.reduce(
            (total, purchase) =>
                total +
                Number(
                    purchase.total ??
                        purchase.totalAmount ??
                        purchase.grandTotal ??
                        purchase.amount ??
                        0
                ),
            0
        );

    /*
     * =========================================
     * ESTIMATED PROFIT
     * =========================================
     */

    const estimatedProfit =
        totalSalesAmount -
        totalPurchaseAmount;

    /*
     * =========================================
     * RECENT SALES
     * =========================================
     */

    const recentSales =
        useMemo(() => {
            return [
                ...businessSales,
            ]
                .sort(
                    (a, b) => {
                        const dateA =
                            new Date(
                                a.createdAt ??
                                    a.date ??
                                    a.saleDate ??
                                    0
                            );

                        const dateB =
                            new Date(
                                b.createdAt ??
                                    b.date ??
                                    b.saleDate ??
                                    0
                            );

                        return (
                            dateB -
                            dateA
                        );
                    }
                )
                .slice(0, 5);
        }, [
            businessSales,
        ]);

    /*
     * =========================================
     * FORMAT CURRENCY
     * =========================================
     */

    const formatCurrency = (
        amount
    ) => {
        return `₹${Number(
            amount || 0
        ).toLocaleString(
            "en-IN"
        )}`;
    };

    /*
     * =========================================
     * FORMAT DATE
     * =========================================
     */

    const formatDate = (
        date
    ) => {
        if (!date) {
            return "—";
        }

        const parsed =
            new Date(date);

        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {
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
                        Loading dashboard...
                    </p>

                </div>

            </div>
        );
    }

    /*
     * =========================================
     * PAGE
     * =========================================
     */

    return (
        <div className="space-y-6">

            {/* =================================
                HEADER
            ================================== */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>

                    <h1 className="text-2xl font-bold text-slate-900">
                        Welcome back,{" "}
                        {user?.name ||
                            "User"} 👋
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Here's what's
                        happening with
                        your business
                        today.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={
                        loadDashboardData
                    }
                    className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >

                    <RefreshCw
                        size={17}
                    />

                    Refresh

                </button>

            </div>

            {/* =================================
                BUSINESS INFO
            ================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <div>

                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Business
                        </p>

                        <h2 className="mt-1 text-lg font-bold text-slate-900">
                            {user?.businessName ||
                                "My Business"}
                        </h2>

                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">

                        <Package
                            size={18}
                            className="text-slate-500"
                        />

                        <span className="text-sm font-semibold text-slate-700">
                            Plan:{" "}
                            {user?.plan ||
                                "Free"}
                        </span>

                    </div>

                </div>

            </div>

            {/* =================================
                MAIN STATS
            ================================== */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <DashboardCard
                    title="Total Products"
                    value={
                        totalProducts
                    }
                    subtitle="Products in inventory"
                    icon={Package}
                />

                <DashboardCard
                    title="Total Stock"
                    value={
                        totalStock.toLocaleString(
                            "en-IN"
                        )
                    }
                    subtitle="Units available"
                    icon={Package}
                />

                <DashboardCard
                    title="Today's Sales"
                    value={formatCurrency(
                        todaySalesAmount
                    )}
                    subtitle={`${todaySales.length} sales today`}
                    icon={
                        ShoppingCart
                    }
                />

                <DashboardCard
                    title="Total Sales"
                    value={formatCurrency(
                        totalSalesAmount
                    )}
                    subtitle={`${businessSales.length} total transactions`}
                    icon={
                        TrendingUp
                    }
                />

            </div>

            {/* =================================
                SECONDARY STATS
            ================================== */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <MiniStat
                    title="Purchases"
                    value={formatCurrency(
                        totalPurchaseAmount
                    )}
                    icon={ShoppingBag}
                />

                <MiniStat
                    title="Customers"
                    value={
                        businessCustomers.length
                    }
                    icon={Users}
                />

                <MiniStat
                    title="Suppliers"
                    value={
                        businessSuppliers.length
                    }
                    icon={Truck}
                />

                <MiniStat
                    title="Est. Profit"
                    value={formatCurrency(
                        estimatedProfit
                    )}
                    icon={
                        IndianRupee
                    }
                />

            </div>

            {/* =================================
                QUICK ACTIONS
            ================================== */}

            <div>

                <div className="mb-4">

                    <h2 className="text-base font-bold text-slate-900">
                        Quick Actions
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Frequently used
                        actions
                    </p>

                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <QuickAction
                        title="Add Product"
                        description="Create a new product"
                        icon={Package}
                        href="/user/products/new"
                    />

                    <QuickAction
                        title="Create Sale"
                        description="Record a new sale"
                        icon={
                            ShoppingCart
                        }
                        href="/user/sales/new"
                    />

                    <QuickAction
                        title="Create Purchase"
                        description="Record a purchase"
                        icon={
                            ShoppingBag
                        }
                        href="/user/purchases/new"
                    />

                    <QuickAction
                        title="Add Customer"
                        description="Create a customer"
                        icon={Users}
                        href="/user/customers"
                    />

                </div>

            </div>

            {/* =================================
                LOW STOCK + RECENT SALES
            ================================== */}

            <div className="grid gap-6 lg:grid-cols-2">

                {/* LOW STOCK */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex items-center justify-between border-b border-slate-200 p-5">

                        <div>

                            <h2 className="text-base font-bold text-slate-900">
                                Low Stock
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Products requiring
                                attention
                            </p>

                        </div>

                        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">

                            <AlertTriangle
                                size={15}
                                className="text-red-500"
                            />

                            <span className="text-xs font-bold text-red-600">
                                {
                                    lowStockProducts.length
                                }
                            </span>

                        </div>

                    </div>

                    {lowStockProducts.length ===
                    0 ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">

                                <Package
                                    size={22}
                                    className="text-emerald-600"
                                />

                            </div>

                            <p className="mt-3 text-sm font-semibold text-slate-700">
                                Stock looks good
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                No products are
                                currently low
                                on stock.
                            </p>

                        </div>
                    ) : (
                        <div>

                            {lowStockProducts
                                .slice(
                                    0,
                                    5
                                )
                                .map(
                                    (
                                        product
                                    ) => {
                                        const stock =
                                            Number(
                                                product.stock ??
                                                    product.quantity ??
                                                    0
                                            );

                                        const minimum =
                                            Number(
                                                product.minStock ??
                                                    product.lowStockThreshold ??
                                                    10
                                            );

                                        return (
                                            <div
                                                key={
                                                    product.id
                                                }
                                                className="flex items-center justify-between border-b border-slate-100 p-5 last:border-b-0"
                                            >

                                                <div className="flex min-w-0 items-center gap-3">

                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">

                                                        <Package
                                                            size={
                                                                18
                                                            }
                                                            className="text-slate-500"
                                                        />

                                                    </div>

                                                    <div className="min-w-0">

                                                        <p className="truncate text-sm font-semibold text-slate-800">
                                                            {
                                                                product.name
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            SKU:{" "}
                                                            {
                                                                product.sku
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                                <div className="text-right">

                                                    <p className="text-sm font-bold text-red-600">
                                                        {
                                                            stock
                                                        }{" "}
                                                        units
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Min:{" "}
                                                        {
                                                            minimum
                                                        }
                                                    </p>

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                        </div>
                    )}

                    {lowStockProducts.length >
                        5 && (
                        <a
                            href="/user/inventory"
                            className="flex items-center justify-center gap-2 border-t border-slate-100 p-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                        >
                            View all low stock
                            products

                            <ArrowRight
                                size={14}
                            />

                        </a>
                    )}

                </div>

                {/* RECENT SALES */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex items-center justify-between border-b border-slate-200 p-5">

                        <div>

                            <h2 className="text-base font-bold text-slate-900">
                                Recent Sales
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Latest sales
                                transactions
                            </p>

                        </div>

                        <a
                            href="/user/sales"
                            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
                        >
                            View all

                            <ArrowRight
                                size={14}
                            />

                        </a>

                    </div>

                    {recentSales.length ===
                    0 ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">

                                <ShoppingCart
                                    size={22}
                                    className="text-slate-500"
                                />

                            </div>

                            <p className="mt-3 text-sm font-semibold text-slate-700">
                                No sales yet
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Your recent sales
                                will appear here.
                            </p>

                        </div>
                    ) : (
                        <div>

                            {recentSales.map(
                                (
                                    sale
                                ) => (
                                    <div
                                        key={
                                            sale.id
                                        }
                                        className="flex items-center justify-between border-b border-slate-100 p-5 last:border-b-0"
                                    >

                                        <div className="flex min-w-0 items-center gap-3">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">

                                                <ShoppingCart
                                                    size={
                                                        18
                                                    }
                                                    className="text-slate-500"
                                                />

                                            </div>

                                            <div className="min-w-0">

                                                <p className="truncate text-sm font-semibold text-slate-800">

                                                    {sale.invoiceNumber ||
                                                        sale.invoiceNo ||
                                                        sale.orderNumber ||
                                                        `Sale #${String(
                                                            sale.id ||
                                                                ""
                                                        ).slice(
                                                            -6
                                                        )}`}

                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">

                                                    {sale.customerName ||
                                                        sale.customer ||
                                                        "Walk-in Customer"}

                                                    {" • "}

                                                    {formatDate(
                                                        sale.createdAt ??
                                                            sale.date ??
                                                            sale.saleDate
                                                    )}

                                                </p>

                                            </div>

                                        </div>

                                        <p className="ml-3 shrink-0 text-sm font-bold text-slate-900">

                                            {formatCurrency(
                                                sale.total ??
                                                    sale.totalAmount ??
                                                    sale.grandTotal ??
                                                    sale.amount ??
                                                    0
                                            )}

                                        </p>

                                    </div>
                                )
                            )}

                        </div>
                    )}

                </div>

            </div>

            {/* =================================
                FOOTER INFO
            ================================== */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                    <div>

                        <p className="text-sm font-semibold text-slate-700">
                            Business Overview
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Dashboard data is
                            currently loaded from
                            localStorage.
                        </p>

                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">

                        <span className="h-2 w-2 rounded-full bg-emerald-500" />

                        Demo Mode

                    </div>

                </div>

            </div>

        </div>
    );
}

/* =========================================
   DASHBOARD CARD
========================================= */

function DashboardCard({
    title,
    value,
    subtitle,
    icon: Icon,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

                <div className="min-w-0">

                    <p className="text-sm font-medium text-slate-400">
                        {title}
                    </p>

                    <p className="mt-2 truncate text-2xl font-bold text-slate-900">
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
   MINI STAT
========================================= */

function MiniStat({
    title,
    value,
    icon: Icon,
}) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">

                <Icon
                    size={19}
                    className="text-slate-600"
                />

            </div>

            <div className="min-w-0">

                <p className="text-xs font-medium text-slate-400">
                    {title}
                </p>

                <p className="mt-1 truncate text-lg font-bold text-slate-900">
                    {value}
                </p>

            </div>

        </div>
    );
}

/* =========================================
   QUICK ACTION
========================================= */

function QuickAction({
    title,
    description,
    icon: Icon,
    href,
}) {
    return (
        <a
            href={href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >

            <div className="flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">

                    <Icon
                        size={19}
                        className="text-slate-600"
                    />

                </div>

                <Plus
                    size={17}
                    className="text-slate-300 transition group-hover:text-slate-600"
                />

            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-800">
                {title}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
                {description}
            </p>

        </a>
    );
}