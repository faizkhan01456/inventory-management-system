"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
    Boxes,
    Search,
    RefreshCw,
    AlertTriangle,
    Package,
    TrendingUp,
    Plus,
    Minus,
    X,
    Save,
    Eye,
    History,
    ArrowRight,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

const ADJUSTMENTS_KEY = "inventory_adjustments";

export default function InventoryPage() {
    const [products, setProducts] = useState([]);

    const [search, setSearch] = useState("");

    const [categoryFilter, setCategoryFilter] =
        useState("ALL");

    const [stockFilter, setStockFilter] =
        useState("ALL");

    const [loading, setLoading] = useState(true);

    const [showAdjustmentModal, setShowAdjustmentModal] =
        useState(false);

    const [selectedProduct, setSelectedProduct] =
        useState(null);

    const [adjustmentType, setAdjustmentType] =
        useState("ADD");

    const [adjustmentQuantity, setAdjustmentQuantity] =
        useState("");

    const [adjustmentReason, setAdjustmentReason] =
        useState("");

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    /*
     * =========================================
     * LOAD PRODUCTS
     * =========================================
     */

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = () => {
        setLoading(true);

        const storedProducts = getStorage(
            STORAGE_KEYS.PRODUCTS,
            []
        );

        setProducts(
            Array.isArray(storedProducts)
                ? storedProducts
                : []
        );

        setLoading(false);
    };

    /*
     * =========================================
     * SAVE PRODUCTS
     * =========================================
     */

    const saveProducts = (updatedProducts) => {
        setProducts(updatedProducts);

        setStorage(
            STORAGE_KEYS.PRODUCTS,
            updatedProducts
        );
    };

    /*
     * =========================================
     * GET CATEGORIES
     * =========================================
     */

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

    /*
     * =========================================
     * STOCK STATUS
     * =========================================
     */

    const getStockStatus = (product) => {
        const stock = Number(
            product.stock || 0
        );

        const minStock = Number(
            product.minStock || 0
        );

        if (stock <= 0) {
            return "OUT_OF_STOCK";
        }

        if (stock <= minStock) {
            return "LOW_STOCK";
        }

        return "IN_STOCK";
    };

    /*
     * =========================================
     * STATS
     * =========================================
     */

    const totalProducts =
        products.length;

    const totalStock =
        products.reduce(
            (total, product) =>
                total +
                Number(
                    product.stock || 0
                ),
            0
        );

    const stockValue =
        products.reduce(
            (total, product) =>
                total +
                Number(
                    product.stock || 0
                ) *
                    Number(
                        product.purchasePrice ||
                            0
                    ),
            0
        );

    const lowStockProducts =
        products.filter(
            (product) =>
                getStockStatus(
                    product
                ) === "LOW_STOCK"
        ).length;

    const outOfStockProducts =
        products.filter(
            (product) =>
                getStockStatus(
                    product
                ) === "OUT_OF_STOCK"
        ).length;

    /*
     * =========================================
     * FILTER PRODUCTS
     * =========================================
     */

    const filteredProducts =
        useMemo(() => {
            return products.filter(
                (product) => {
                    const searchText =
                        search
                            .trim()
                            .toLowerCase();

                    const matchesSearch =
                        !searchText ||
                        String(
                            product.name ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        String(
                            product.sku ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        String(
                            product.category ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                searchText
                            );

                    const matchesCategory =
                        categoryFilter ===
                            "ALL" ||
                        String(
                            product.category ||
                                ""
                        ) ===
                            categoryFilter;

                    const status =
                        getStockStatus(
                            product
                        );

                    const matchesStock =
                        stockFilter ===
                            "ALL" ||
                        status ===
                            stockFilter;

                    return (
                        matchesSearch &&
                        matchesCategory &&
                        matchesStock
                    );
                }
            );
        }, [
            products,
            search,
            categoryFilter,
            stockFilter,
        ]);

    /*
     * =========================================
     * OPEN ADJUSTMENT MODAL
     * =========================================
     */

    const openAdjustmentModal = (
        product,
        type = "ADD"
    ) => {
        setSelectedProduct(product);

        setAdjustmentType(type);

        setAdjustmentQuantity("");

        setAdjustmentReason("");

        setError("");

        setShowAdjustmentModal(true);
    };

    /*
     * =========================================
     * CLOSE MODAL
     * =========================================
     */

    const closeAdjustmentModal = () => {
        if (saving) {
            return;
        }

        setShowAdjustmentModal(false);

        setSelectedProduct(null);

        setAdjustmentQuantity("");

        setAdjustmentReason("");

        setError("");
    };

    /*
     * =========================================
     * HANDLE STOCK ADJUSTMENT
     * =========================================
     */

    const handleAdjustment = (event) => {
        event.preventDefault();

        if (!selectedProduct) {
            setError(
                "Product not found."
            );

            return;
        }

        const quantity = Number(
            adjustmentQuantity
        );

        if (
            !adjustmentQuantity ||
            !Number.isFinite(
                quantity
            ) ||
            quantity <= 0
        ) {
            setError(
                "Please enter a valid quantity."
            );

            return;
        }

        const previousStock =
            Number(
                selectedProduct.stock ||
                    0
            );

        /*
         * Remove stock validation
         */

        if (
            adjustmentType ===
                "REMOVE" &&
            quantity >
                previousStock
        ) {
            setError(
                `Only ${previousStock} units are available in stock.`
            );

            return;
        }

        const newStock =
            adjustmentType ===
            "ADD"
                ? previousStock +
                  quantity
                : previousStock -
                  quantity;

        setSaving(true);

        const now =
            new Date().toISOString();

        /*
         * =====================================
         * UPDATE PRODUCT
         * =====================================
         */

        const updatedProducts =
            products.map(
                (product) => {
                    if (
                        String(
                            product.id
                        ) !==
                        String(
                            selectedProduct.id
                        )
                    ) {
                        return product;
                    }

                    return {
                        ...product,

                        stock: newStock,

                        updatedAt: now,

                        lastStockAdjustment:
                            {
                                type:
                                    adjustmentType,

                                quantity:
                                    quantity,

                                reason:
                                    adjustmentReason.trim() ||
                                    "Manual stock adjustment",

                                previousStock:
                                    previousStock,

                                newStock:
                                    newStock,

                                createdAt:
                                    now,
                            },
                    };
                }
            );

        /*
         * =====================================
         * CREATE ADJUSTMENT HISTORY
         * =====================================
         */

        const existingAdjustments =
            getStorage(
                ADJUSTMENTS_KEY,
                []
            );

        const adjustments =
            Array.isArray(
                existingAdjustments
            )
                ? existingAdjustments
                : [];

        const adjustmentRecord = {
            id: `adjustment_${Date.now()}`,

            productId:
                selectedProduct.id,

            productName:
                selectedProduct.name,

            sku:
                selectedProduct.sku ||
                "",

            type:
                adjustmentType,

            quantity:
                quantity,

            reason:
                adjustmentReason.trim() ||
                "Manual stock adjustment",

            previousStock:
                previousStock,

            newStock:
                newStock,

            unit:
                selectedProduct.unit ||
                "PCS",

            createdAt:
                now,
        };

        /*
         * Save both
         */

        setStorage(
            STORAGE_KEYS.PRODUCTS,
            updatedProducts
        );

        setStorage(
            ADJUSTMENTS_KEY,
            [
                adjustmentRecord,
                ...adjustments,
            ]
        );

        setProducts(
            updatedProducts
        );

        /*
         * Close
         */

        setTimeout(() => {
            setSaving(false);

            setShowAdjustmentModal(
                false
            );

            setSelectedProduct(null);

            setAdjustmentQuantity("");

            setAdjustmentReason("");

            setError("");
        }, 300);
    };

    /*
     * =========================================
     * FORMAT CURRENCY
     * =========================================
     */

    const formatCurrency = (
        value
    ) => {
        return `₹${Number(
            value || 0
        ).toLocaleString(
            "en-IN"
        )}`;
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
                        Loading inventory...
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* =================================
                HEADER
            ================================== */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>

                    <div className="flex items-center gap-2">

                        <Boxes
                            size={25}
                            className="text-slate-700"
                        />

                        <h1 className="text-2xl font-bold text-slate-900">
                            Inventory
                        </h1>

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Monitor and manage your
                        product stock.
                    </p>

                </div>

                <div className="flex gap-2">

                    <Link
                        href="/user/inventory/adjustments"
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >

                        <History
                            size={17}
                        />

                        Adjustments

                        <ArrowRight
                            size={15}
                        />

                    </Link>

                    <button
                        type="button"
                        onClick={
                            loadProducts
                        }
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >

                        <RefreshCw
                            size={17}
                        />

                        Refresh

                    </button>

                </div>

            </div>

            {/* =================================
                STATS
            ================================== */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <InventoryStat
                    title="Total Products"
                    value={
                        totalProducts
                    }
                    subtitle="Products in inventory"
                    icon={Package}
                    type="default"
                />

                <InventoryStat
                    title="Total Stock"
                    value={totalStock.toLocaleString(
                        "en-IN"
                    )}
                    subtitle="Units available"
                    icon={Boxes}
                    type="info"
                />

                <InventoryStat
                    title="Stock Value"
                    value={formatCurrency(
                        stockValue
                    )}
                    subtitle="Purchase value"
                    icon={TrendingUp}
                    type="success"
                />

                <InventoryStat
                    title="Low / Out of Stock"
                    value={`${lowStockProducts} / ${outOfStockProducts}`}
                    subtitle="Needs attention"
                    icon={
                        AlertTriangle
                    }
                    type="warning"
                />

            </div>

            {/* =================================
                FILTERS
            ================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="flex flex-col gap-3 xl:flex-row">

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
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                        />

                    </div>

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

                    <select
                        value={
                            stockFilter
                        }
                        onChange={(
                            event
                        ) =>
                            setStockFilter(
                                event
                                    .target
                                    .value
                            )
                        }
                        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                    >

                        <option value="ALL">
                            All Stock
                        </option>

                        <option value="IN_STOCK">
                            In Stock
                        </option>

                        <option value="LOW_STOCK">
                            Low Stock
                        </option>

                        <option value="OUT_OF_STOCK">
                            Out of Stock
                        </option>

                    </select>

                </div>

            </div>

            {/* =================================
                STOCK ALERT
            ================================== */}

            {lowStockProducts +
                outOfStockProducts >
                0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">

                        <AlertTriangle
                            size={18}
                            className="text-amber-600"
                        />

                    </div>

                    <div>

                        <p className="text-sm font-bold text-amber-900">
                            Stock attention required
                        </p>

                        <p className="mt-1 text-xs text-amber-700">

                            {lowStockProducts}{" "}
                            product
                            {lowStockProducts !==
                            1
                                ? "s are"
                                : " is"}{" "}
                            low on stock and{" "}

                            {outOfStockProducts}{" "}
                            product
                            {outOfStockProducts !==
                            1
                                ? "s are"
                                : " is"}{" "}
                            out of stock.

                        </p>

                    </div>

                </div>
            )}

            {/* =================================
                TABLE
            ================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                    <h2 className="text-base font-bold text-slate-900">
                        Stock Overview
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Showing{" "}
                        {
                            filteredProducts.length
                        }{" "}
                        of{" "}
                        {products.length}{" "}
                        products
                    </p>

                </div>

                {filteredProducts.length ===
                0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                            <Boxes
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

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        PURCHASE
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        SELLING
                                    </th>

                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500">
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

                                        const status =
                                            getStockStatus(
                                                product
                                            );

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
                                                                className="text-slate-600"
                                                            />

                                                        </div>

                                                        <div className="min-w-0">

                                                            <p className="truncate text-sm font-bold text-slate-900">
                                                                {
                                                                    product.name
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 max-w-[180px] truncate text-xs text-slate-400">
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

                                                    <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700">
                                                        {
                                                            product.sku ||
                                                            "—"
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

                                                <td className="px-6 py-5 text-right">

                                                    <span className="text-sm font-medium text-slate-700">
                                                        {formatCurrency(
                                                            product.purchasePrice
                                                        )}
                                                    </span>

                                                </td>

                                                {/* SELLING */}

                                                <td className="px-6 py-5 text-right">

                                                    <span className="text-sm font-bold text-slate-900">
                                                        {formatCurrency(
                                                            product.sellingPrice
                                                        )}
                                                    </span>

                                                </td>

                                                {/* STOCK */}

                                                <td className="px-6 py-5">

                                                    <div className="text-center">

                                                        <p
                                                            className={`text-sm font-bold ${
                                                                status ===
                                                                "OUT_OF_STOCK"
                                                                    ? "text-red-600"
                                                                    : status ===
                                                                        "LOW_STOCK"
                                                                      ? "text-amber-600"
                                                                      : "text-slate-900"
                                                            }`}
                                                        >

                                                            {
                                                                stock
                                                            }{" "}

                                                            <span className="text-xs font-medium text-slate-400">
                                                                {
                                                                    product.unit ||
                                                                    "PCS"
                                                                }
                                                            </span>

                                                        </p>

                                                        <p className="mt-1 text-[11px] text-slate-400">
                                                            Min:{" "}
                                                            {
                                                                minStock
                                                            }
                                                        </p>

                                                    </div>

                                                </td>

                                                {/* STATUS */}

                                                <td className="px-6 py-5">

                                                    <StockStatus
                                                        status={
                                                            status
                                                        }
                                                    />

                                                </td>

                                                {/* ACTIONS */}

                                                <td className="px-6 py-5">

                                                    <div className="flex justify-end gap-1">

                                                        <button
                                                            type="button"
                                                            title="Add Stock"
                                                            onClick={() =>
                                                                openAdjustmentModal(
                                                                    product,
                                                                    "ADD"
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                                                        >

                                                            <Plus
                                                                size={
                                                                    17
                                                                }
                                                            />

                                                        </button>

                                                        <button
                                                            type="button"
                                                            title="Remove Stock"
                                                            onClick={() =>
                                                                openAdjustmentModal(
                                                                    product,
                                                                    "REMOVE"
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                                        >

                                                            <Minus
                                                                size={
                                                                    17
                                                                }
                                                            />

                                                        </button>

                                                        <Link
                                                            href={`/user/products/${product.id}`}
                                                            title="View Product"
                                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                                        >

                                                            <Eye
                                                                size={
                                                                    17
                                                                }
                                                            />

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

            {/* =================================
                ADJUSTMENT MODAL
            ================================== */}

            {showAdjustmentModal &&
                selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

                    <div
                        className="absolute inset-0"
                        onClick={
                            closeAdjustmentModal
                        }
                    />

                    <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* HEADER */}

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                            <div>

                                <div className="flex items-center gap-2">

                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                            adjustmentType ===
                                            "ADD"
                                                ? "bg-emerald-50"
                                                : "bg-red-50"
                                        }`}
                                    >

                                        {adjustmentType ===
                                        "ADD" ? (
                                            <Plus
                                                size={
                                                    18
                                                }
                                                className="text-emerald-600"
                                            />
                                        ) : (
                                            <Minus
                                                size={
                                                    18
                                                }
                                                className="text-red-600"
                                            />
                                        )}

                                    </div>

                                    <h2 className="text-lg font-bold text-slate-900">
                                        {adjustmentType ===
                                        "ADD"
                                            ? "Add Stock"
                                            : "Remove Stock"}
                                    </h2>

                                </div>

                                <p className="mt-1 text-xs text-slate-400">
                                    {
                                        selectedProduct.name
                                    }
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeAdjustmentModal
                                }
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >

                                <X
                                    size={
                                        19
                                    }
                                />

                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={
                                handleAdjustment
                            }
                        >

                            <div className="space-y-5 p-6">

                                {/* CURRENT STOCK */}

                                <div className="grid grid-cols-2 gap-3">

                                    <div className="rounded-xl bg-slate-50 p-4">

                                        <p className="text-xs font-medium text-slate-400">
                                            Current Stock
                                        </p>

                                        <p className="mt-1 text-xl font-bold text-slate-900">

                                            {
                                                selectedProduct.stock ||
                                                0
                                            }{" "}

                                            <span className="text-xs font-medium text-slate-400">
                                                {
                                                    selectedProduct.unit ||
                                                    "PCS"
                                                }
                                            </span>

                                        </p>

                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4">

                                        <p className="text-xs font-medium text-slate-400">
                                            Minimum Stock
                                        </p>

                                        <p className="mt-1 text-xl font-bold text-slate-900">

                                            {
                                                selectedProduct.minStock ||
                                                0
                                            }{" "}

                                            <span className="text-xs font-medium text-slate-400">
                                                {
                                                    selectedProduct.unit ||
                                                    "PCS"
                                                }
                                            </span>

                                        </p>

                                    </div>

                                </div>

                                {/* TYPE */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Adjustment Type
                                    </label>

                                    <div className="grid grid-cols-2 gap-3">

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAdjustmentType(
                                                    "ADD"
                                                );

                                                setError(
                                                    ""
                                                );
                                            }}
                                            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                                adjustmentType ===
                                                "ADD"
                                                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >

                                            <Plus
                                                size={
                                                    17
                                                }
                                            />

                                            Add Stock

                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAdjustmentType(
                                                    "REMOVE"
                                                );

                                                setError(
                                                    ""
                                                );
                                            }}
                                            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                                adjustmentType ===
                                                "REMOVE"
                                                    ? "border-red-300 bg-red-50 text-red-700"
                                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >

                                            <Minus
                                                size={
                                                    17
                                                }
                                            />

                                            Remove Stock

                                        </button>

                                    </div>

                                </div>

                                {/* QUANTITY */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">

                                        Quantity

                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>

                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={
                                            adjustmentQuantity
                                        }
                                        onChange={(
                                            event
                                        ) => {
                                            setAdjustmentQuantity(
                                                event
                                                    .target
                                                    .value
                                            );

                                            setError(
                                                ""
                                            );
                                        }}
                                        placeholder="Enter quantity"
                                        className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-800 outline-none focus:bg-white ${
                                            error
                                                ? "border-red-300"
                                                : "border-slate-200 focus:border-slate-400"
                                        }`}
                                    />

                                    {error && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {
                                                error
                                            }
                                        </p>
                                    )}

                                </div>

                                {/* REASON */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Reason
                                    </label>

                                    <textarea
                                        value={
                                            adjustmentReason
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setAdjustmentReason(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        rows={
                                            3
                                        }
                                        placeholder="e.g. New purchase, damaged stock, manual correction..."
                                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                                    />

                                </div>

                                {/* PREVIEW */}

                                {adjustmentQuantity &&
                                    Number(
                                        adjustmentQuantity
                                    ) >
                                        0 && (
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                                            <p className="text-xs font-medium text-slate-400">
                                                New Stock
                                            </p>

                                            <p
                                                className={`mt-1 text-xl font-bold ${
                                                    adjustmentType ===
                                                    "ADD"
                                                        ? "text-emerald-600"
                                                        : "text-red-600"
                                                }`}
                                            >

                                                {adjustmentType ===
                                                "ADD"
                                                    ? Number(
                                                          selectedProduct.stock ||
                                                              0
                                                      ) +
                                                      Number(
                                                          adjustmentQuantity
                                                      )
                                                    : Math.max(
                                                          0,
                                                          Number(
                                                              selectedProduct.stock ||
                                                                  0
                                                          ) -
                                                              Number(
                                                                  adjustmentQuantity
                                                              )
                                                      )}{" "}

                                                <span className="text-xs font-medium text-slate-400">
                                                    {
                                                        selectedProduct.unit ||
                                                        "PCS"
                                                    }
                                                </span>

                                            </p>

                                        </div>
                                    )}

                            </div>

                            {/* FOOTER */}

                            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

                                <button
                                    type="button"
                                    onClick={
                                        closeAdjustmentModal
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        saving
                                    }
                                    className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                        adjustmentType ===
                                        "ADD"
                                            ? "bg-emerald-600 hover:bg-emerald-700"
                                            : "bg-red-600 hover:bg-red-700"
                                    }`}
                                >

                                    {saving ? (
                                        <RefreshCw
                                            size={
                                                16
                                            }
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Save
                                            size={
                                                16
                                            }
                                        />
                                    )}

                                    {saving
                                        ? "Saving..."
                                        : "Save Adjustment"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

/*
 * =========================================
 * STAT CARD
 * =========================================
 */

function InventoryStat({
    title,
    value,
    subtitle,
    icon: Icon,
    type = "default",
}) {
    const styles = {
        default:
            "bg-slate-100 text-slate-600",

        info:
            "bg-blue-50 text-blue-600",

        success:
            "bg-emerald-50 text-emerald-600",

        warning:
            "bg-amber-50 text-amber-600",
    };

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

/*
 * =========================================
 * STOCK STATUS
 * =========================================
 */

function StockStatus({
    status,
}) {
    if (
        status ===
        "OUT_OF_STOCK"
    ) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">

                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

                OUT OF STOCK

            </span>
        );
    }

    if (
        status ===
        "LOW_STOCK"
    ) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600">

                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

                LOW STOCK

            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            IN STOCK

        </span>
    );
}