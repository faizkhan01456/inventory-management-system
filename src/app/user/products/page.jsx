"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
    Package,
    Plus,
    Search,
    Eye,
    Pencil,
    Trash2,
    RefreshCw,
    Filter,
    AlertTriangle,
    CheckCircle2,
    XCircle,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

const defaultProducts = [
    {
        id: "product_001",
        name: "Wireless Keyboard",
        sku: "KB-WL-001",
        category: "Electronics",
        purchasePrice: 700,
        sellingPrice: 999,
        stock: 24,
        minStock: 10,
        unit: "PCS",
        tax: 18,
        status: "ACTIVE",
        description:
            "Wireless keyboard for desktop and laptop.",
        createdAt: "2026-09-01",
    },
    {
        id: "product_002",
        name: "Wireless Mouse",
        sku: "MS-WL-001",
        category: "Electronics",
        purchasePrice: 350,
        sellingPrice: 599,
        stock: 8,
        minStock: 10,
        unit: "PCS",
        tax: 18,
        status: "ACTIVE",
        description:
            "Wireless optical mouse.",
        createdAt: "2026-09-02",
    },
    {
        id: "product_003",
        name: "USB Type-C Cable",
        sku: "USB-C-001",
        category: "Accessories",
        purchasePrice: 120,
        sellingPrice: 249,
        stock: 45,
        minStock: 15,
        unit: "PCS",
        tax: 18,
        status: "ACTIVE",
        description:
            "Fast charging USB Type-C cable.",
        createdAt: "2026-09-03",
    },
    {
        id: "product_004",
        name: "Bluetooth Speaker",
        sku: "SP-BT-001",
        category: "Electronics",
        purchasePrice: 900,
        sellingPrice: 1499,
        stock: 3,
        minStock: 5,
        unit: "PCS",
        tax: 18,
        status: "ACTIVE",
        description:
            "Portable Bluetooth speaker.",
        createdAt: "2026-09-04",
    },
];

export default function ProductsPage() {
    const [products, setProducts] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [categoryFilter, setCategoryFilter] =
        useState("ALL");

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = () => {
        setLoading(true);

        const storedProducts =
            getStorage(
                STORAGE_KEYS.PRODUCTS,
                null
            );

        if (
            Array.isArray(storedProducts)
        ) {
            setProducts(
                storedProducts
            );
        } else {
            setStorage(
                STORAGE_KEYS.PRODUCTS,
                defaultProducts
            );

            setProducts(
                defaultProducts
            );
        }

        setLoading(false);
    };

    const saveProducts = (data) => {
        setProducts(data);

        setStorage(
            STORAGE_KEYS.PRODUCTS,
            data
        );
    };

    const categories = useMemo(() => {
        return [
            ...new Set(
                products
                    .map(
                        (product) =>
                            product.category
                    )
                    .filter(Boolean)
            ),
        ];
    }, [products]);

    const filteredProducts =
        useMemo(() => {
            return products.filter(
                (product) => {
                    const searchText =
                        search
                            .toLowerCase()
                            .trim();

                    const matchesSearch =
                        !searchText ||
                        product.name
                            ?.toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        product.sku
                            ?.toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        product.category
                            ?.toLowerCase()
                            .includes(
                                searchText
                            );

                    const matchesStatus =
                        statusFilter ===
                            "ALL" ||
                        product.status ===
                            statusFilter;

                    const matchesCategory =
                        categoryFilter ===
                            "ALL" ||
                        product.category ===
                            categoryFilter;

                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesCategory
                    );
                }
            );
        }, [
            products,
            search,
            statusFilter,
            categoryFilter,
        ]);

    const totalProducts =
        products.length;

    const activeProducts =
        products.filter(
            (product) =>
                product.status ===
                "ACTIVE"
        ).length;

    const inactiveProducts =
        products.filter(
            (product) =>
                product.status !==
                "ACTIVE"
        ).length;

    const lowStockProducts =
        products.filter((product) => {
            const stock = Number(
                product.stock || 0
            );

            const minStock =
                Number(
                    product.minStock ||
                        0
                );

            return (
                product.status ===
                    "ACTIVE" &&
                stock <= minStock
            );
        }).length;

    const handleDelete = (
        productId
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this product?"
            );

        if (!confirmed) {
            return;
        }

        const updated =
            products.filter(
                (product) =>
                    product.id !==
                    productId
            );

        saveProducts(updated);
    };

    const handleToggleStatus = (
        productId
    ) => {
        const updated =
            products.map(
                (product) =>
                    product.id ===
                    productId
                        ? {
                              ...product,
                              status:
                                  product.status ===
                                  "ACTIVE"
                                      ? "INACTIVE"
                                      : "ACTIVE",
                          }
                        : product
            );

        saveProducts(updated);
    };

    const formatCurrency = (
        amount
    ) => {
        return `₹${Number(
            amount || 0
        ).toLocaleString(
            "en-IN"
        )}`;
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
                        Loading products...
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

                        <Package
                            size={24}
                            className="text-slate-700"
                        />

                        <h1 className="text-2xl font-bold text-slate-900">
                            Products
                        </h1>

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage your products,
                        pricing and stock.
                    </p>

                </div>

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={
                            loadProducts
                        }
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        <RefreshCw
                            size={17}
                        />

                        Refresh
                    </button>

                    <Link
                        href="/user/products/new"
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                    >
                        <Plus
                            size={17}
                        />

                        Add Product
                    </Link>

                </div>

            </div>

            {/* STATS */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                    title="Total Products"
                    value={
                        totalProducts
                    }
                    icon={Package}
                />

                <StatCard
                    title="Active Products"
                    value={
                        activeProducts
                    }
                    icon={
                        CheckCircle2
                    }
                    type="success"
                />

                <StatCard
                    title="Inactive Products"
                    value={
                        inactiveProducts
                    }
                    icon={XCircle}
                    type="danger"
                />

                <StatCard
                    title="Low Stock"
                    value={
                        lowStockProducts
                    }
                    icon={
                        AlertTriangle
                    }
                    type="warning"
                />

            </div>

            {/* FILTERS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="flex flex-col gap-3 lg:flex-row">

                    <div className="relative flex-1">

                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(
                                event
                            ) =>
                                setSearch(
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder="Search by product name, SKU or category..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                        />

                    </div>

                    <div className="flex items-center gap-2">

                        <Filter
                            size={17}
                            className="text-slate-400"
                        />

                        <select
                            value={
                                categoryFilter
                            }
                            onChange={(
                                event
                            ) =>
                                setCategoryFilter(
                                    event
                                        .target
                                        .value
                                )
                            }
                            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                        >

                            <option value="ALL">
                                All Categories
                            </option>

                            {categories.map(
                                (
                                    category
                                ) => (
                                    <option
                                        key={
                                            category
                                        }
                                        value={
                                            category
                                        }
                                    >
                                        {
                                            category
                                        }
                                    </option>
                                )
                            )}

                        </select>

                    </div>

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
                        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                    >

                        <option value="ALL">
                            All Status
                        </option>

                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="INACTIVE">
                            Inactive
                        </option>

                    </select>

                </div>

            </div>

            {/* TABLE */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                    <div>

                        <h2 className="text-base font-bold text-slate-900">
                            Product List
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            Showing{" "}
                            {
                                filteredProducts.length
                            }{" "}
                            of{" "}
                            {
                                products.length
                            }{" "}
                            products
                        </p>

                    </div>

                </div>

                {filteredProducts.length ===
                0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                            <Package
                                size={28}
                                className="text-slate-400"
                            />

                        </div>

                        <h3 className="mt-4 text-base font-bold text-slate-800">
                            No products found
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                            Try changing your
                            search or filters.
                        </p>

                        <Link
                            href="/user/products/new"
                            className="mt-5 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            <Plus
                                size={16}
                            />

                            Add Product
                        </Link>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1100px]">

                            <thead>

                                <tr className="border-b border-slate-200 bg-slate-50">

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        PRODUCT
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        SKU
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        CATEGORY
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        PURCHASE
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        SELLING
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        STOCK
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        STATUS
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        ACTIONS
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredProducts.map(
                                    (
                                        product
                                    ) => {
                                        const stock =
                                            Number(
                                                product.stock ||
                                                    0
                                            );

                                        const minStock =
                                            Number(
                                                product.minStock ||
                                                    0
                                            );

                                        const isLowStock =
                                            product.status ===
                                                "ACTIVE" &&
                                            stock <=
                                                minStock;

                                        return (
                                            <tr
                                                key={
                                                    product.id
                                                }
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                            >

                                                {/* PRODUCT */}

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">

                                                            <Package
                                                                size={
                                                                    18
                                                                }
                                                                className="text-slate-500"
                                                            />

                                                        </div>

                                                        <div>

                                                            <p className="font-semibold text-slate-900">
                                                                {
                                                                    product.name
                                                                }
                                                            </p>

                                                            <p className="mt-1 max-w-[220px] truncate text-xs text-slate-400">
                                                                {
                                                                    product.description ||
                                                                    "No description"
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* SKU */}

                                                <td className="px-6 py-5">

                                                    <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">
                                                        {
                                                            product.sku
                                                        }
                                                    </span>

                                                </td>

                                                {/* CATEGORY */}

                                                <td className="px-6 py-5">

                                                    <span className="text-sm text-slate-600">
                                                        {
                                                            product.category ||
                                                            "Uncategorized"
                                                        }
                                                    </span>

                                                </td>

                                                {/* PURCHASE */}

                                                <td className="px-6 py-5">

                                                    <span className="text-sm font-medium text-slate-700">
                                                        {formatCurrency(
                                                            product.purchasePrice
                                                        )}
                                                    </span>

                                                </td>

                                                {/* SELLING */}

                                                <td className="px-6 py-5">

                                                    <span className="text-sm font-bold text-slate-900">
                                                        {formatCurrency(
                                                            product.sellingPrice
                                                        )}
                                                    </span>

                                                </td>

                                                {/* STOCK */}

                                                <td className="px-6 py-5">

                                                    <div>

                                                        <div className="flex items-center gap-2">

                                                            <span
                                                                className={`text-sm font-bold ${
                                                                    isLowStock
                                                                        ? "text-red-600"
                                                                        : "text-slate-800"
                                                                }`}
                                                            >
                                                                {
                                                                    stock
                                                                }
                                                            </span>

                                                            <span className="text-xs text-slate-400">
                                                                {
                                                                    product.unit ||
                                                                    "PCS"
                                                                }
                                                            </span>

                                                        </div>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            Min:{" "}
                                                            {
                                                                minStock
                                                            }
                                                        </p>

                                                    </div>

                                                </td>

                                                {/* STATUS */}

                                                <td className="px-6 py-5">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                product.id
                                                            )
                                                        }
                                                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                                                            product.status ===
                                                            "ACTIVE"
                                                                ? "bg-emerald-50 text-emerald-600"
                                                                : "bg-red-50 text-red-600"
                                                        }`}
                                                    >
                                                        {
                                                            product.status
                                                        }
                                                    </button>

                                                </td>

                                                {/* ACTIONS */}

                                                <td className="px-6 py-5">

                                                    <div className="flex justify-end gap-1">

                                                        <Link
                                                            href={`/user/products/${product.id}`}
                                                            title="View"
                                                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                        >
                                                            <Eye
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </Link>

                                                        <Link
                                                            href={`/user/products/${product.id}?edit=true`}
                                                            title="Edit"
                                                            className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                                        >
                                                            <Pencil
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    product.id
                                                                )
                                                            }
                                                            title="Delete"
                                                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <Trash2
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </button>

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

/* =========================================
   STAT CARD
========================================= */

function StatCard({
    title,
    value,
    icon: Icon,
    type = "default",
}) {
    const styles = {
        default:
            "bg-slate-100 text-slate-600",

        success:
            "bg-emerald-50 text-emerald-600",

        danger:
            "bg-red-50 text-red-600",

        warning:
            "bg-orange-50 text-orange-600",
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-sm font-medium text-slate-400">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {value}
                    </p>

                </div>

                <div
                    className={`rounded-xl p-3 ${styles[type]}`}
                >
                    <Icon
                        size={20}
                    />
                </div>

            </div>

        </div>
    );
}