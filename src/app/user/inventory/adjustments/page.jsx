"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
    ArrowLeft,
    Boxes,
    Plus,
    Minus,
    Search,
    RefreshCw,
    Package,
    X,
    Save,
    History,
    TrendingUp,
    TrendingDown,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

const ADJUSTMENTS_KEY =
    "inventory_adjustments";

export default function StockAdjustmentsPage() {
    const [products, setProducts] = useState([]);
    const [adjustments, setAdjustments] =
        useState([]);

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] =
        useState("ALL");
    const [productFilter, setProductFilter] =
        useState("ALL");

    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] =
        useState(false);

    const [adjustmentType, setAdjustmentType] =
        useState("ADD");

    const [selectedProductId, setSelectedProductId] =
        useState("");

    const [quantity, setQuantity] =
        useState("");

    const [reason, setReason] =
        useState("");

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    /*
     * =========================================
     * LOAD DATA
     * =========================================
     */

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);

        const storedProducts =
            getStorage(
                STORAGE_KEYS.PRODUCTS,
                []
            );

        const storedAdjustments =
            getStorage(
                ADJUSTMENTS_KEY,
                []
            );

        setProducts(
            Array.isArray(
                storedProducts
            )
                ? storedProducts
                : []
        );

        setAdjustments(
            Array.isArray(
                storedAdjustments
            )
                ? storedAdjustments
                : []
        );

        setLoading(false);
    };

    /*
     * =========================================
     * SAVE ADJUSTMENTS
     * =========================================
     */

    const saveAdjustments = (
        data
    ) => {
        setAdjustments(data);

        setStorage(
            ADJUSTMENTS_KEY,
            data
        );
    };

    /*
     * =========================================
     * SAVE PRODUCTS
     * =========================================
     */

    const saveProducts = (
        data
    ) => {
        setProducts(data);

        setStorage(
            STORAGE_KEYS.PRODUCTS,
            data
        );
    };

    /*
     * =========================================
     * OPEN MODAL
     * =========================================
     */

    const openAddModal = (
        type = "ADD"
    ) => {
        setAdjustmentType(type);

        setSelectedProductId("");

        setQuantity("");

        setReason("");

        setError("");

        setShowModal(true);
    };

    /*
     * =========================================
     * CLOSE MODAL
     * =========================================
     */

    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);

        setError("");
    };

    /*
     * =========================================
     * SELECTED PRODUCT
     * =========================================
     */

    const selectedProduct =
        products.find(
            (product) =>
                String(product.id) ===
                String(
                    selectedProductId
                )
        );

    /*
     * =========================================
     * HANDLE ADJUSTMENT
     * =========================================
     */

    const handleSubmit = (
        event
    ) => {
        event.preventDefault();

        setError("");

        if (!selectedProduct) {
            setError(
                "Please select a product."
            );

            return;
        }

        const adjustmentQuantity =
            Number(quantity);

        if (
            !quantity ||
            !Number.isFinite(
                adjustmentQuantity
            ) ||
            adjustmentQuantity <= 0
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

        if (
            adjustmentType ===
                "REMOVE" &&
            adjustmentQuantity >
                previousStock
        ) {
            setError(
                `Only ${previousStock} units are available in stock.`
            );

            return;
        }

        const newStock =
            adjustmentType === "ADD"
                ? previousStock +
                  adjustmentQuantity
                : previousStock -
                  adjustmentQuantity;

        setSaving(true);

        const now =
            new Date();

        const adjustmentId =
            `adjustment_${Date.now()}`;

        const adjustment = {
            id: adjustmentId,

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
                adjustmentQuantity,

            reason:
                reason.trim() ||
                "Manual stock adjustment",

            previousStock,

            newStock,

            unit:
                selectedProduct.unit ||
                "PCS",

            createdAt:
                now.toISOString(),
        };

        /*
         * Update Product Stock
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

                        updatedAt:
                            now.toISOString(),

                        lastStockAdjustment:
                            {
                                type:
                                    adjustmentType,

                                quantity:
                                    adjustmentQuantity,

                                reason:
                                    adjustment.reason,

                                previousStock,

                                newStock,

                                createdAt:
                                    now.toISOString(),
                            },
                    };
                }
            );

        /*
         * Save Adjustment History
         */

        saveAdjustments([
            adjustment,
            ...adjustments,
        ]);

        /*
         * Save Product
         */

        saveProducts(
            updatedProducts
        );

        setTimeout(() => {
            setSaving(false);

            setShowModal(false);

            setSelectedProductId("");

            setQuantity("");

            setReason("");

            setError("");
        }, 300);
    };

    /*
     * =========================================
     * PRODUCT LIST
     * =========================================
     */

    const productOptions =
        useMemo(() => {
            return [
                ...products,
            ].sort(
                (a, b) =>
                    String(
                        a.name || ""
                    ).localeCompare(
                        String(
                            b.name || ""
                        )
                    )
            );
        }, [products]);

    /*
     * =========================================
     * FILTER ADJUSTMENTS
     * =========================================
     */

    const filteredAdjustments =
        useMemo(() => {
            return adjustments.filter(
                (adjustment) => {
                    const searchText =
                        search
                            .trim()
                            .toLowerCase();

                    const matchesSearch =
                        !searchText ||
                        String(
                            adjustment.productName ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        String(
                            adjustment.sku ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        String(
                            adjustment.reason ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                searchText
                            );

                    const matchesType =
                        typeFilter ===
                            "ALL" ||
                        adjustment.type ===
                            typeFilter;

                    const matchesProduct =
                        productFilter ===
                            "ALL" ||
                        String(
                            adjustment.productId
                        ) ===
                            String(
                                productFilter
                            );

                    return (
                        matchesSearch &&
                        matchesType &&
                        matchesProduct
                    );
                }
            );
        }, [
            adjustments,
            search,
            typeFilter,
            productFilter,
        ]);

    /*
     * =========================================
     * STATS
     * =========================================
     */

    const totalAdjustments =
        adjustments.length;

    const totalAdded =
        adjustments
            .filter(
                (item) =>
                    item.type ===
                    "ADD"
            )
            .reduce(
                (total, item) =>
                    total +
                    Number(
                        item.quantity ||
                            0
                    ),
                0
            );

    const totalRemoved =
        adjustments
            .filter(
                (item) =>
                    item.type ===
                    "REMOVE"
            )
            .reduce(
                (total, item) =>
                    total +
                    Number(
                        item.quantity ||
                            0
                    ),
                0
            );

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

        return new Date(
            date
        ).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
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
                        Loading adjustments...
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

                <div className="flex items-center gap-4">

                    <Link
                        href="/user/inventory"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                    >
                        <ArrowLeft
                            size={18}
                        />
                    </Link>

                    <div>

                        <div className="flex items-center gap-2">

                            <Boxes
                                size={24}
                                className="text-slate-700"
                            />

                            <h1 className="text-2xl font-bold text-slate-900">
                                Stock Adjustments
                            </h1>

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Add or remove stock and
                            view adjustment history.
                        </p>

                    </div>

                </div>

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={
                            loadData
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
                        onClick={() =>
                            openAddModal(
                                "ADD"
                            )
                        }
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    >
                        <Plus
                            size={17}
                        />

                        Adjust Stock
                    </button>

                </div>

            </div>

            {/* =================================
                STATS
            ================================== */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <AdjustmentStat
                    title="Total Adjustments"
                    value={
                        totalAdjustments
                    }
                    subtitle="All stock adjustments"
                    icon={History}
                    type="default"
                />

                <AdjustmentStat
                    title="Stock Added"
                    value={
                        totalAdded
                    }
                    subtitle="Total units added"
                    icon={TrendingUp}
                    type="success"
                />

                <AdjustmentStat
                    title="Stock Removed"
                    value={
                        totalRemoved
                    }
                    subtitle="Total units removed"
                    icon={TrendingDown}
                    type="danger"
                />

                <AdjustmentStat
                    title="Products"
                    value={
                        products.length
                    }
                    subtitle="Products available"
                    icon={Package}
                    type="info"
                />

            </div>

            {/* =================================
                FILTERS
            ================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="flex flex-col gap-3 xl:flex-row">

                    {/* SEARCH */}

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
                            placeholder="Search product, SKU or reason..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                        />

                    </div>

                    {/* PRODUCT */}

                    <select
                        value={
                            productFilter
                        }
                        onChange={(
                            event
                        ) =>
                            setProductFilter(
                                event
                                    .target
                                    .value
                            )
                        }
                        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                    >

                        <option value="ALL">
                            All Products
                        </option>

                        {productOptions.map(
                            (
                                product
                            ) => (
                                <option
                                    key={
                                        product.id
                                    }
                                    value={
                                        product.id
                                    }
                                >
                                    {
                                        product.name
                                    }
                                </option>
                            )
                        )}

                    </select>

                    {/* TYPE */}

                    <select
                        value={
                            typeFilter
                        }
                        onChange={(
                            event
                        ) =>
                            setTypeFilter(
                                event
                                    .target
                                    .value
                            )
                        }
                        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                    >

                        <option value="ALL">
                            All Types
                        </option>

                        <option value="ADD">
                            Stock Added
                        </option>

                        <option value="REMOVE">
                            Stock Removed
                        </option>

                    </select>

                </div>

            </div>

            {/* =================================
                HISTORY TABLE
            ================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                    <h2 className="text-base font-bold text-slate-900">
                        Adjustment History
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Showing{" "}
                        {
                            filteredAdjustments.length
                        }{" "}
                        of{" "}
                        {
                            adjustments.length
                        }{" "}
                        adjustments
                    </p>

                </div>

                {filteredAdjustments.length ===
                0 ? (
                    <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                            <History
                                size={28}
                                className="text-slate-400"
                            />

                        </div>

                        <h3 className="mt-4 text-base font-bold text-slate-800">
                            No adjustments found
                        </h3>

                        <p className="mt-1 max-w-sm text-sm text-slate-400">
                            Stock adjustment history
                            will appear here when
                            you add or remove
                            inventory.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                openAddModal(
                                    "ADD"
                                )
                            }
                            className="mt-5 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >

                            <Plus
                                size={16}
                            />

                            Adjust Stock

                        </button>

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
                                        TYPE
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        QUANTITY
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        PREVIOUS
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        NEW STOCK
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        REASON
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        DATE
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredAdjustments.map(
                                    (
                                        adjustment
                                    ) => (
                                        <tr
                                            key={
                                                adjustment.id
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
                                                                adjustment.productName
                                                            }
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-slate-400">
                                                            {
                                                                adjustment.sku ||
                                                                "No SKU"
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* TYPE */}

                                            <td className="px-6 py-5">

                                                {adjustment.type ===
                                                "ADD" ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">

                                                        <Plus
                                                            size={
                                                                13
                                                            }
                                                        />

                                                        STOCK ADDED

                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">

                                                        <Minus
                                                            size={
                                                                13
                                                            }
                                                        />

                                                        STOCK REMOVED

                                                    </span>
                                                )}

                                            </td>

                                            {/* QUANTITY */}

                                            <td className="px-6 py-5 text-right">

                                                <span
                                                    className={`text-sm font-bold ${
                                                        adjustment.type ===
                                                        "ADD"
                                                            ? "text-emerald-600"
                                                            : "text-red-600"
                                                    }`}
                                                >
                                                    {adjustment.type ===
                                                    "ADD"
                                                        ? "+"
                                                        : "-"}
                                                    {
                                                        adjustment.quantity
                                                    }{" "}
                                                    <span className="text-xs font-medium text-slate-400">
                                                        {
                                                            adjustment.unit
                                                        }
                                                    </span>
                                                </span>

                                            </td>

                                            {/* PREVIOUS */}

                                            <td className="px-6 py-5 text-right">

                                                <span className="text-sm font-semibold text-slate-700">
                                                    {
                                                        adjustment.previousStock
                                                    }{" "}
                                                    <span className="text-xs text-slate-400">
                                                        {
                                                            adjustment.unit
                                                        }
                                                    </span>
                                                </span>

                                            </td>

                                            {/* NEW */}

                                            <td className="px-6 py-5 text-right">

                                                <span className="text-sm font-bold text-slate-900">
                                                    {
                                                        adjustment.newStock
                                                    }{" "}
                                                    <span className="text-xs font-medium text-slate-400">
                                                        {
                                                            adjustment.unit
                                                        }
                                                    </span>
                                                </span>

                                            </td>

                                            {/* REASON */}

                                            <td className="px-6 py-5">

                                                <p className="max-w-[220px] truncate text-sm text-slate-500">
                                                    {
                                                        adjustment.reason ||
                                                        "—"
                                                    }
                                                </p>

                                            </td>

                                            {/* DATE */}

                                            <td className="px-6 py-5">

                                                <span className="whitespace-nowrap text-sm text-slate-500">
                                                    {formatDate(
                                                        adjustment.createdAt
                                                    )}
                                                </span>

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {/* =================================
                ADD / REMOVE MODAL
            ================================== */}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

                    <div
                        className="absolute inset-0"
                        onClick={
                            closeModal
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
                                        Adjust Stock
                                    </h2>

                                </div>

                                <p className="mt-1 text-xs text-slate-400">
                                    Manually add or
                                    remove product
                                    stock.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeModal
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
                                handleSubmit
                            }
                        >

                            <div className="space-y-5 p-6">

                                {/* TYPE */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Adjustment Type
                                    </label>

                                    <div className="grid grid-cols-2 gap-3">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setAdjustmentType(
                                                    "ADD"
                                                )
                                            }
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
                                            onClick={() =>
                                                setAdjustmentType(
                                                    "REMOVE"
                                                )
                                            }
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

                                {/* PRODUCT */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">

                                        Product

                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>

                                    </label>

                                    <select
                                        value={
                                            selectedProductId
                                        }
                                        onChange={(
                                            event
                                        ) => {
                                            setSelectedProductId(
                                                event
                                                    .target
                                                    .value
                                            );

                                            setError(
                                                ""
                                            );
                                        }}
                                        className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:bg-white ${
                                            error &&
                                            !selectedProduct
                                                ? "border-red-300"
                                                : "border-slate-200 focus:border-slate-400"
                                        }`}
                                    >

                                        <option value="">
                                            Select product
                                        </option>

                                        {productOptions.map(
                                            (
                                                product
                                            ) => (
                                                <option
                                                    key={
                                                        product.id
                                                    }
                                                    value={
                                                        product.id
                                                    }
                                                >
                                                    {
                                                        product.name
                                                    }{" "}
                                                    —{" "}
                                                    {
                                                        product.sku
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                                {/* CURRENT STOCK */}

                                {selectedProduct && (
                                    <div className="grid grid-cols-2 gap-3">

                                        <div className="rounded-xl bg-slate-50 p-4">

                                            <p className="text-xs font-medium text-slate-400">
                                                Current Stock
                                            </p>

                                            <p className="mt-1 text-xl font-bold text-slate-900">

                                                {
                                                    selectedProduct.stock
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
                                )}

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
                                            quantity
                                        }
                                        onChange={(
                                            event
                                        ) => {
                                            setQuantity(
                                                event
                                                    .target
                                                    .value
                                            );

                                            setError(
                                                ""
                                            );
                                        }}
                                        placeholder="Enter quantity"
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
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
                                            reason
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setReason(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        rows={
                                            3
                                        }
                                        placeholder="e.g. New purchase, damaged stock, stock correction..."
                                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                                    />

                                </div>

                                {/* PREVIEW */}

                                {selectedProduct &&
                                    quantity &&
                                    Number(
                                        quantity
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
                                                          quantity
                                                      )
                                                    : Math.max(
                                                          0,
                                                          Number(
                                                              selectedProduct.stock ||
                                                                  0
                                                          ) -
                                                              Number(
                                                                  quantity
                                                              )
                                                      )}{" "}

                                                <span className="text-xs font-medium text-slate-400">
                                                    {
                                                        selectedProduct.unit
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
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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

function AdjustmentStat({
    title,
    value,
    subtitle,
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

        info:
            "bg-blue-50 text-blue-600",
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