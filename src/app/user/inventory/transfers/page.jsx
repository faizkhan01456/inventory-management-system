"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
    ArrowLeft,
    ArrowRight,
    Boxes,
    Package,
    Search,
    RefreshCw,
    Plus,
    X,
    Save,
    Warehouse,
    Clock3,
    CheckCircle2,
    Truck,
    XCircle,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

const TRANSFERS_KEY =
    "inventory_transfers";

const WAREHOUSES_KEY =
    STORAGE_KEYS.WAREHOUSES ||
    "inventory_warehouses";

export default function InventoryTransfersPage() {
    const [products, setProducts] =
        useState([]);

    const [warehouses, setWarehouses] =
        useState([]);

    const [transfers, setTransfers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [showModal, setShowModal] =
        useState(false);

    const [selectedProductId, setSelectedProductId] =
        useState("");

    const [fromWarehouseId, setFromWarehouseId] =
        useState("");

    const [toWarehouseId, setToWarehouseId] =
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

        const storedWarehouses =
            getStorage(
                WAREHOUSES_KEY,
                []
            );

        const storedTransfers =
            getStorage(
                TRANSFERS_KEY,
                []
            );

        setProducts(
            Array.isArray(storedProducts)
                ? storedProducts
                : []
        );

        /*
         * If warehouses already exist,
         * use them.
         *
         * Otherwise create demo warehouses
         * for the transfer demo.
         */

        if (
            Array.isArray(
                storedWarehouses
            ) &&
            storedWarehouses.length > 0
        ) {
            setWarehouses(
                storedWarehouses
            );
        } else {
            setWarehouses([
                {
                    id: "warehouse_main",
                    name: "Main Warehouse",
                    code: "WH-001",
                    location: "Main Branch",
                    status: "ACTIVE",
                },
                {
                    id: "warehouse_branch",
                    name: "Branch Warehouse",
                    code: "WH-002",
                    location: "City Branch",
                    status: "ACTIVE",
                },
            ]);
        }

        setTransfers(
            Array.isArray(
                storedTransfers
            )
                ? storedTransfers
                : []
        );

        setLoading(false);
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
     * ACTIVE WAREHOUSES
     * =========================================
     */

    const activeWarehouses =
        useMemo(() => {
            return warehouses.filter(
                (warehouse) =>
                    String(
                        warehouse.status ||
                            "ACTIVE"
                    ).toUpperCase() ===
                    "ACTIVE"
            );
        }, [warehouses]);

    /*
     * =========================================
     * OPEN MODAL
     * =========================================
     */

    const openTransferModal = () => {
        setSelectedProductId("");

        setFromWarehouseId("");

        setToWarehouseId("");

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

        setSelectedProductId("");

        setFromWarehouseId("");

        setToWarehouseId("");

        setQuantity("");

        setReason("");

        setError("");
    };

    /*
     * =========================================
     * CREATE TRANSFER
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

        if (!fromWarehouseId) {
            setError(
                "Please select source warehouse."
            );

            return;
        }

        if (!toWarehouseId) {
            setError(
                "Please select destination warehouse."
            );

            return;
        }

        if (
            String(
                fromWarehouseId
            ) ===
            String(
                toWarehouseId
            )
        ) {
            setError(
                "Source and destination warehouse cannot be same."
            );

            return;
        }

        const transferQuantity =
            Number(quantity);

        if (
            !quantity ||
            !Number.isFinite(
                transferQuantity
            ) ||
            transferQuantity <= 0
        ) {
            setError(
                "Please enter a valid quantity."
            );

            return;
        }

        const currentStock =
            Number(
                selectedProduct.stock ||
                    0
            );

        if (
            transferQuantity >
            currentStock
        ) {
            setError(
                `Only ${currentStock} units are available in stock.`
            );

            return;
        }

        const sourceWarehouse =
            activeWarehouses.find(
                (warehouse) =>
                    String(
                        warehouse.id
                    ) ===
                    String(
                        fromWarehouseId
                    )
            );

        const destinationWarehouse =
            activeWarehouses.find(
                (warehouse) =>
                    String(
                        warehouse.id
                    ) ===
                    String(
                        toWarehouseId
                    )
            );

        if (
            !sourceWarehouse ||
            !destinationWarehouse
        ) {
            setError(
                "Invalid warehouse selected."
            );

            return;
        }

        setSaving(true);

        const now =
            new Date().toISOString();

        /*
         * =====================================
         * UPDATE PRODUCT STOCK
         *
         * Current demo product model has
         * global stock instead of separate
         * warehouse stock.
         *
         * Therefore transfer decreases the
         * available source stock and records
         * destination warehouse in history.
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

                        stock:
                            currentStock -
                            transferQuantity,

                        updatedAt: now,

                        lastStockTransfer:
                            {
                                quantity:
                                    transferQuantity,

                                fromWarehouseId,

                                fromWarehouseName:
                                    sourceWarehouse.name,

                                toWarehouseId,

                                toWarehouseName:
                                    destinationWarehouse.name,

                                previousStock:
                                    currentStock,

                                newStock:
                                    currentStock -
                                    transferQuantity,

                                createdAt:
                                    now,
                            },
                    };
                }
            );

        /*
         * =====================================
         * CREATE TRANSFER RECORD
         * =====================================
         */

        const transfer = {
            id:
                `transfer_${Date.now()}`,

            productId:
                selectedProduct.id,

            productName:
                selectedProduct.name,

            sku:
                selectedProduct.sku ||
                "",

            quantity:
                transferQuantity,

            unit:
                selectedProduct.unit ||
                "PCS",

            fromWarehouseId,

            fromWarehouseName:
                sourceWarehouse.name,

            toWarehouseId,

            toWarehouseName:
                destinationWarehouse.name,

            reason:
                reason.trim() ||
                "Stock transfer",

            previousStock:
                currentStock,

            newStock:
                currentStock -
                transferQuantity,

            status:
                "COMPLETED",

            createdAt:
                now,
        };

        /*
         * =====================================
         * SAVE TRANSFER
         * =====================================
         */

        const existingTransfers =
            getStorage(
                TRANSFERS_KEY,
                []
            );

        const transferHistory =
            Array.isArray(
                existingTransfers
            )
                ? existingTransfers
                : [];

        setStorage(
            STORAGE_KEYS.PRODUCTS,
            updatedProducts
        );

        setStorage(
            TRANSFERS_KEY,
            [
                transfer,
                ...transferHistory,
            ]
        );

        setProducts(
            updatedProducts
        );

        setTransfers([
            transfer,
            ...transfers,
        ]);

        setTimeout(() => {
            setSaving(false);

            setShowModal(false);

            setSelectedProductId("");

            setFromWarehouseId("");

            setToWarehouseId("");

            setQuantity("");

            setReason("");

            setError("");
        }, 300);
    };

    /*
     * =========================================
     * FILTER TRANSFERS
     * =========================================
     */

    const filteredTransfers =
        useMemo(() => {
            return transfers.filter(
                (transfer) => {
                    const searchText =
                        search
                            .trim()
                            .toLowerCase();

                    const matchesSearch =
                        !searchText ||
                        String(
                            transfer.productName ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        String(
                            transfer.sku ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        String(
                            transfer.fromWarehouseName ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        String(
                            transfer.toWarehouseName ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        String(
                            transfer.reason ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                searchText
                            );

                    const matchesStatus =
                        statusFilter ===
                            "ALL" ||
                        transfer.status ===
                            statusFilter;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );
        }, [
            transfers,
            search,
            statusFilter,
        ]);

    /*
     * =========================================
     * STATS
     * =========================================
     */

    const totalTransfers =
        transfers.length;

    const completedTransfers =
        transfers.filter(
            (transfer) =>
                transfer.status ===
                "COMPLETED"
        ).length;

    const pendingTransfers =
        transfers.filter(
            (transfer) =>
                transfer.status ===
                "PENDING"
        ).length;

    const totalTransferredUnits =
        transfers.reduce(
            (total, transfer) =>
                total +
                Number(
                    transfer.quantity ||
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
                        Loading transfers...
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

                            <Truck
                                size={24}
                                className="text-slate-700"
                            />

                            <h1 className="text-2xl font-bold text-slate-900">
                                Stock Transfers
                            </h1>

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Transfer stock between
                            warehouses.
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
                        onClick={
                            openTransferModal
                        }
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    >

                        <Plus
                            size={17}
                        />

                        New Transfer

                    </button>

                </div>

            </div>

            {/* =================================
                STATS
            ================================== */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <TransferStat
                    title="Total Transfers"
                    value={
                        totalTransfers
                    }
                    subtitle="All stock transfers"
                    icon={Boxes}
                    type="default"
                />

                <TransferStat
                    title="Completed"
                    value={
                        completedTransfers
                    }
                    subtitle="Completed transfers"
                    icon={
                        CheckCircle2
                    }
                    type="success"
                />

                <TransferStat
                    title="Pending"
                    value={
                        pendingTransfers
                    }
                    subtitle="Pending transfers"
                    icon={Clock3}
                    type="warning"
                />

                <TransferStat
                    title="Units Transferred"
                    value={totalTransferredUnits.toLocaleString(
                        "en-IN"
                    )}
                    subtitle="Total units moved"
                    icon={Truck}
                    type="info"
                />

            </div>

            {/* =================================
                INFO
            ================================== */}

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">

                <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">

                        <Warehouse
                            size={18}
                            className="text-blue-600"
                        />

                    </div>

                    <div>

                        <p className="text-sm font-bold text-blue-900">
                            Warehouse Transfer
                        </p>

                        <p className="mt-1 text-xs leading-5 text-blue-700">
                            Select a product, source
                            warehouse, destination
                            warehouse and quantity
                            to create a stock transfer.
                        </p>

                    </div>

                </div>

            </div>

            {/* =================================
                FILTERS
            ================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="flex flex-col gap-3 md:flex-row">

                    <div className="relative flex-1">

                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={
                                search
                            }
                            onChange={(
                                event
                            ) =>
                                setSearch(
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder="Search product, SKU or warehouse..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                        />

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

            {/* =================================
                TRANSFER TABLE
            ================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                    <h2 className="text-base font-bold text-slate-900">
                        Transfer History
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Showing{" "}
                        {
                            filteredTransfers.length
                        }{" "}
                        of{" "}
                        {transfers.length}{" "}
                        transfers
                    </p>

                </div>

                {filteredTransfers.length ===
                0 ? (
                    <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                            <Truck
                                size={28}
                                className="text-slate-400"
                            />

                        </div>

                        <h3 className="mt-4 text-base font-bold text-slate-800">
                            No transfers found
                        </h3>

                        <p className="mt-1 max-w-sm text-sm text-slate-400">
                            Create your first stock
                            transfer to see it here.
                        </p>

                        <button
                            type="button"
                            onClick={
                                openTransferModal
                            }
                            className="mt-5 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >

                            <Plus
                                size={16}
                            />

                            New Transfer

                        </button>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1150px]">

                            <thead>

                                <tr className="border-b border-slate-200 bg-slate-50">

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        PRODUCT
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        FROM
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        TO
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        QUANTITY
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        REASON
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        STATUS
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        DATE
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredTransfers.map(
                                    (
                                        transfer
                                    ) => (
                                        <tr
                                            key={
                                                transfer.id
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

                                                    <div>

                                                        <p className="text-sm font-bold text-slate-900">
                                                            {
                                                                transfer.productName
                                                            }
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-slate-400">
                                                            {
                                                                transfer.sku ||
                                                                "No SKU"
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* FROM */}

                                            <td className="px-6 py-5">

                                                <div>

                                                    <p className="text-sm font-semibold text-slate-700">
                                                        {
                                                            transfer.fromWarehouseName
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Source
                                                        Warehouse
                                                    </p>

                                                </div>

                                            </td>

                                            {/* TO */}

                                            <td className="px-6 py-5">

                                                <div className="flex items-center gap-2">

                                                    <ArrowRight
                                                        size={
                                                            16
                                                        }
                                                        className="text-slate-400"
                                                    />

                                                    <div>

                                                        <p className="text-sm font-semibold text-slate-700">
                                                            {
                                                                transfer.toWarehouseName
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            Destination
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* QUANTITY */}

                                            <td className="px-6 py-5 text-right">

                                                <span className="text-sm font-bold text-slate-900">
                                                    {
                                                        transfer.quantity
                                                    }{" "}

                                                    <span className="text-xs font-medium text-slate-400">
                                                        {
                                                            transfer.unit ||
                                                            "PCS"
                                                        }
                                                    </span>

                                                </span>

                                            </td>

                                            {/* REASON */}

                                            <td className="px-6 py-5">

                                                <p className="max-w-[190px] truncate text-sm text-slate-500">
                                                    {
                                                        transfer.reason ||
                                                        "—"
                                                    }
                                                </p>

                                            </td>

                                            {/* STATUS */}

                                            <td className="px-6 py-5">

                                                <TransferStatus
                                                    status={
                                                        transfer.status
                                                    }
                                                />

                                            </td>

                                            {/* DATE */}

                                            <td className="px-6 py-5">

                                                <span className="whitespace-nowrap text-sm text-slate-500">
                                                    {formatDate(
                                                        transfer.createdAt
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
                NEW TRANSFER MODAL
            ================================== */}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

                    <div
                        className="absolute inset-0"
                        onClick={
                            closeModal
                        }
                    />

                    <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        {/* HEADER */}

                        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

                            <div>

                                <div className="flex items-center gap-2">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">

                                        <Truck
                                            size={
                                                18
                                            }
                                            className="text-blue-600"
                                        />

                                    </div>

                                    <h2 className="text-lg font-bold text-slate-900">
                                        New Stock Transfer
                                    </h2>

                                </div>

                                <p className="mt-1 text-xs text-slate-400">
                                    Move stock between
                                    warehouses.
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
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white"
                                    >

                                        <option value="">
                                            Select product
                                        </option>

                                        {products.map(
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
                                                    — Stock:{" "}
                                                    {
                                                        product.stock
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                                {/* CURRENT STOCK */}

                                {selectedProduct && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                                        <div className="flex items-center justify-between">

                                            <div>

                                                <p className="text-xs font-medium text-slate-400">
                                                    Available Stock
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

                                            <Package
                                                size={
                                                    22
                                                }
                                                className="text-slate-400"
                                            />

                                        </div>

                                    </div>
                                )}

                                {/* WAREHOUSE ROUTE */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Transfer Route
                                    </label>

                                    <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-end">

                                        {/* FROM */}

                                        <div>

                                            <p className="mb-2 text-xs font-medium text-slate-400">
                                                From
                                            </p>

                                            <select
                                                value={
                                                    fromWarehouseId
                                                }
                                                onChange={(
                                                    event
                                                ) => {
                                                    setFromWarehouseId(
                                                        event
                                                            .target
                                                            .value
                                                    );

                                                    setError(
                                                        ""
                                                    );
                                                }}
                                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white"
                                            >

                                                <option value="">
                                                    Select source
                                                </option>

                                                {activeWarehouses.map(
                                                    (
                                                        warehouse
                                                    ) => (
                                                        <option
                                                            key={
                                                                warehouse.id
                                                            }
                                                            value={
                                                                warehouse.id
                                                            }
                                                        >
                                                            {
                                                                warehouse.name
                                                            }
                                                        </option>
                                                    )
                                                )}

                                            </select>

                                        </div>

                                        {/* ARROW */}

                                        <div className="hidden h-12 items-center justify-center md:flex">

                                            <ArrowRight
                                                size={
                                                    20
                                                }
                                                className="text-slate-400"
                                            />

                                        </div>

                                        {/* TO */}

                                        <div>

                                            <p className="mb-2 text-xs font-medium text-slate-400">
                                                To
                                            </p>

                                            <select
                                                value={
                                                    toWarehouseId
                                                }
                                                onChange={(
                                                    event
                                                ) => {
                                                    setToWarehouseId(
                                                        event
                                                            .target
                                                            .value
                                                    );

                                                    setError(
                                                        ""
                                                    );
                                                }}
                                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white"
                                            >

                                                <option value="">
                                                    Select destination
                                                </option>

                                                {activeWarehouses.map(
                                                    (
                                                        warehouse
                                                    ) => (
                                                        <option
                                                            key={
                                                                warehouse.id
                                                            }
                                                            value={
                                                                warehouse.id
                                                            }
                                                        >
                                                            {
                                                                warehouse.name
                                                            }
                                                        </option>
                                                    )
                                                )}

                                            </select>

                                        </div>

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
                                        placeholder="Enter transfer quantity"
                                        className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-800 outline-none focus:bg-white ${
                                            error
                                                ? "border-red-300"
                                                : "border-slate-200 focus:border-slate-400"
                                        }`}
                                    />

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
                                        placeholder="e.g. Branch stock replenishment..."
                                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                                    />

                                </div>

                                {/* ERROR */}

                                {error && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                                        <p className="text-xs font-medium text-red-600">
                                            {
                                                error
                                            }
                                        </p>

                                    </div>
                                )}

                                {/* PREVIEW */}

                                {selectedProduct &&
                                    quantity &&
                                    Number(
                                        quantity
                                    ) >
                                        0 && (
                                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">

                                            <div className="flex items-center justify-between">

                                                <div>

                                                    <p className="text-xs font-medium text-blue-500">
                                                        Stock After Transfer
                                                    </p>

                                                    <p className="mt-1 text-xl font-bold text-blue-900">

                                                        {Math.max(
                                                            0,
                                                            Number(
                                                                selectedProduct.stock ||
                                                                    0
                                                            ) -
                                                                Number(
                                                                    quantity
                                                                )
                                                        )}{" "}

                                                        <span className="text-xs font-medium text-blue-500">
                                                            {
                                                                selectedProduct.unit ||
                                                                "PCS"
                                                            }
                                                        </span>

                                                    </p>

                                                </div>

                                                <ArrowRight
                                                    size={
                                                        22
                                                    }
                                                    className="text-blue-500"
                                                />

                                            </div>

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
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        saving
                                    }
                                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
                                        ? "Creating..."
                                        : "Create Transfer"}

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

function TransferStat({
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

        warning:
            "bg-amber-50 text-amber-600",

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

/*
 * =========================================
 * TRANSFER STATUS
 * =========================================
 */

function TransferStatus({
    status,
}) {
    if (
        status ===
        "COMPLETED"
    ) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">

                <CheckCircle2
                    size={13}
                />

                COMPLETED

            </span>
        );
    }

    if (
        status ===
        "PENDING"
    ) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600">

                <Clock3
                    size={13}
                />

                PENDING

            </span>
        );
    }

    if (
        status ===
        "CANCELLED"
    ) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">

                <XCircle
                    size={13}
                />

                CANCELLED

            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            {status || "UNKNOWN"}
        </span>
    );
}