"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Warehouse,
    Phone,
    Mail,
    MapPin,
    User,
    CalendarDays,
    Package,
    Boxes,
    ArrowRightLeft,
    UserCheck,
    UserX,
    FileText,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

const WAREHOUSES_KEY =
    STORAGE_KEYS.WAREHOUSES || "inventory_warehouses";

const PRODUCTS_KEY =
    STORAGE_KEYS.PRODUCTS || "inventory_products";

const TRANSFERS_KEY =
    "inventory_transfers";

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

export default function WarehouseDetailsPage({
    params,
}) {
    const [warehouse, setWarehouse] =
        useState(null);

    const [products, setProducts] =
        useState([]);

    const [transfers, setTransfers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        const loadWarehouse =
            async () => {
                const resolvedParams =
                    await params;

                const storedWarehouses =
                    getStorage(
                        WAREHOUSES_KEY,
                        []
                    );

                const storedProducts =
                    getStorage(
                        PRODUCTS_KEY,
                        []
                    );

                const storedTransfers =
                    getStorage(
                        TRANSFERS_KEY,
                        []
                    );

                const found =
                    Array.isArray(
                        storedWarehouses
                    )
                        ? storedWarehouses.find(
                              (
                                  item
                              ) =>
                                  String(
                                      item.id
                                  ) ===
                                  String(
                                      resolvedParams.id
                                  )
                          )
                        : null;

                setWarehouse(
                    found || null
                );

                setProducts(
                    Array.isArray(
                        storedProducts
                    )
                        ? storedProducts
                        : []
                );

                setTransfers(
                    Array.isArray(
                        storedTransfers
                    )
                        ? storedTransfers
                        : []
                );

                setLoading(false);
            };

        loadWarehouse();
    }, [params]);

    /*
     * ========================================
     * TRANSFER HISTORY
     * ========================================
     */

    const warehouseTransfers =
        useMemo(() => {
            if (!warehouse) {
                return [];
            }

            return transfers
                .filter(
                    (transfer) =>
                        String(
                            transfer.sourceWarehouseId
                        ) ===
                            String(
                                warehouse.id
                            ) ||
                        String(
                            transfer.destinationWarehouseId
                        ) ===
                            String(
                                warehouse.id
                            )
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        new Date(
                            b.createdAt ||
                                b.transferDate ||
                                0
                        ) -
                        new Date(
                            a.createdAt ||
                                a.transferDate ||
                                0
                        )
                );
        }, [
            warehouse,
            transfers,
        ]);

    /*
     * ========================================
     * TRANSFER STATS
     * ========================================
     */

    const incomingTransfers =
        warehouseTransfers.filter(
            (transfer) =>
                String(
                    transfer.destinationWarehouseId
                ) ===
                String(
                    warehouse?.id
                )
        );

    const outgoingTransfers =
        warehouseTransfers.filter(
            (transfer) =>
                String(
                    transfer.sourceWarehouseId
                ) ===
                String(
                    warehouse?.id
                )
        );

    const incomingUnits =
        incomingTransfers.reduce(
            (total, transfer) =>
                total +
                Number(
                    transfer.quantity ||
                        0
                ),
            0
        );

    const outgoingUnits =
        outgoingTransfers.reduce(
            (total, transfer) =>
                total +
                Number(
                    transfer.quantity ||
                        0
                ),
            0
        );

    /*
     * ========================================
     * STATUS
     * ========================================
     */

    const toggleStatus = () => {
        if (!warehouse) {
            return;
        }

        const storedWarehouses =
            getStorage(
                WAREHOUSES_KEY,
                []
            );

        const currentStatus =
            String(
                warehouse.status ||
                    "ACTIVE"
            ).toUpperCase();

        const newStatus =
            currentStatus ===
            "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const updatedWarehouses =
            Array.isArray(
                storedWarehouses
            )
                ? storedWarehouses.map(
                      (
                          item
                      ) =>
                          item.id ===
                          warehouse.id
                              ? {
                                    ...item,
                                    status:
                                        newStatus,
                                    updatedAt:
                                        new Date().toISOString(),
                                }
                              : item
                  )
                : [];

        setStorage(
            WAREHOUSES_KEY,
            updatedWarehouses
        );

        setWarehouse(
            (previous) => ({
                ...previous,
                status:
                    newStatus,
            })
        );
    };

    /*
     * ========================================
     * PRODUCT STOCK
     *
     * Current project uses global product
     * stock. It is not warehouse-specific yet.
     * ========================================
     */

    const totalProductStock =
        products.reduce(
            (total, product) =>
                total +
                Number(
                    product.stock ||
                        0
                ),
            0
        );

    const totalProducts =
        products.length;

    /*
     * ========================================
     * FORMAT NUMBER
     * ========================================
     */

    const formatNumber = (
        value
    ) => {
        return Number(
            value || 0
        ).toLocaleString(
            "en-IN"
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading warehouse...
                    </p>

                </div>

            </div>
        );
    }

    if (!warehouse) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                        <Warehouse
                            size={28}
                            className="text-slate-400"
                        />

                    </div>

                    <h2 className="mt-4 text-xl font-bold text-slate-900">
                        Warehouse Not Found
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        The warehouse you're
                        looking for does not
                        exist.
                    </p>

                    <Link
                        href="/user/warehouses"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        <ArrowLeft
                            size={17}
                        />
                        Back to Warehouses
                    </Link>

                </div>

            </div>
        );
    }

    const status =
        String(
            warehouse.status ||
                "ACTIVE"
        ).toUpperCase();

    const warehouseName =
        warehouse.name ||
        warehouse.warehouseName ||
        "Warehouse";

    const warehouseCode =
        warehouse.code ||
        warehouse.warehouseCode ||
        "—";

    const manager =
        warehouse.manager ||
        warehouse.managerName ||
        "—";

    return (
        <div className="space-y-6">

            {/* HEADER */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div className="flex items-center gap-3">

                    <Link
                        href="/user/warehouses"
                        className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <div>

                        <div className="flex items-center gap-2">

                            <Warehouse
                                size={24}
                                className="text-slate-700"
                            />

                            <h1 className="text-2xl font-bold text-slate-900">
                                Warehouse Details
                            </h1>

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            {
                                warehouseName
                            }
                        </p>

                    </div>

                </div>

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={
                            toggleStatus
                        }
                        className={
                            status ===
                            "ACTIVE"
                                ? "flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
                                : "flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600 hover:bg-emerald-100"
                        }
                    >

                        {status ===
                        "ACTIVE" ? (
                            <>
                                <UserX
                                    size={17}
                                />
                                Deactivate
                            </>
                        ) : (
                            <>
                                <UserCheck
                                    size={17}
                                />
                                Activate
                            </>
                        )}

                    </button>

                    <Link
                        href="/user/warehouses"
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        <Warehouse
                            size={17}
                        />
                        All Warehouses
                    </Link>

                </div>

            </div>

            {/* PROFILE */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 p-6">

                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                        <div className="flex items-center gap-4">

                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                                <Warehouse
                                    size={30}
                                    className="text-slate-600"
                                />

                            </div>

                            <div>

                                <h2 className="text-xl font-bold text-slate-900">
                                    {
                                        warehouseName
                                    }
                                </h2>

                                <div className="mt-2 flex flex-wrap items-center gap-3">

                                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                                        {
                                            warehouseCode
                                        }
                                    </span>

                                    <span
                                        className={
                                            status ===
                                            "ACTIVE"
                                                ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600"
                                                : "inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600"
                                        }
                                    >

                                        {status ===
                                        "ACTIVE" ? (
                                            <>
                                                <UserCheck
                                                    size={
                                                        13
                                                    }
                                                />
                                                ACTIVE
                                            </>
                                        ) : (
                                            <>
                                                <UserX
                                                    size={
                                                        13
                                                    }
                                                />
                                                INACTIVE
                                            </>
                                        )}

                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                {/* DETAILS */}

                <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-4">

                    <DetailItem
                        icon={Warehouse}
                        label="Branch"
                        value={
                            warehouse.branch ||
                            "—"
                        }
                    />

                    <DetailItem
                        icon={User}
                        label="Manager"
                        value={
                            manager
                        }
                    />

                    <DetailItem
                        icon={Phone}
                        label="Phone"
                        value={
                            warehouse.phone ||
                            "—"
                        }
                    />

                    <DetailItem
                        icon={Mail}
                        label="Email"
                        value={
                            warehouse.email ||
                            "—"
                        }
                    />

                </div>

            </div>

            {/* STATS */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <WarehouseStat
                    title="Products"
                    value={
                        formatNumber(
                            totalProducts
                        )
                    }
                    subtitle="Products in inventory"
                    icon={
                        Package
                    }
                />

                <WarehouseStat
                    title="Stock Units"
                    value={
                        formatNumber(
                            totalProductStock
                        )
                    }
                    subtitle="Global inventory units"
                    icon={Boxes}
                />

                <WarehouseStat
                    title="Incoming"
                    value={
                        formatNumber(
                            incomingUnits
                        )
                    }
                    subtitle="Units transferred in"
                    icon={
                        ArrowRightLeft
                    }
                />

                <WarehouseStat
                    title="Outgoing"
                    value={
                        formatNumber(
                            outgoingUnits
                        )
                    }
                    subtitle="Units transferred out"
                    icon={
                        ArrowRightLeft
                    }
                />

            </div>

            {/* ADDRESS + CAPACITY */}

            <div className="grid gap-6 lg:grid-cols-2">

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-2">

                        <MapPin
                            size={20}
                            className="text-slate-600"
                        />

                        <h2 className="font-bold text-slate-900">
                            Warehouse Address
                        </h2>

                    </div>

                    <div className="mt-5 rounded-xl bg-slate-50 p-4">

                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">

                            {[
                                warehouse.address,
                                warehouse.city,
                                warehouse.state,
                                warehouse.pincode,
                            ]
                                .filter(
                                    Boolean
                                )
                                .join(
                                    "\n"
                                ) ||
                                "No address added."}

                        </p>

                    </div>

                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-2">

                        <Boxes
                            size={20}
                            className="text-slate-600"
                        />

                        <h2 className="font-bold text-slate-900">
                            Warehouse Capacity
                        </h2>

                    </div>

                    <div className="mt-5 rounded-xl bg-slate-50 p-5">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Capacity
                        </p>

                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            {formatNumber(
                                warehouse.capacity
                            )}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Units
                        </p>

                    </div>

                </div>

            </div>

            {/* NOTES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center gap-2">

                    <FileText
                        size={20}
                        className="text-slate-600"
                    />

                    <h2 className="font-bold text-slate-900">
                        Notes
                    </h2>

                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">

                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {warehouse.notes ||
                            "No notes added."}
                    </p>

                </div>

            </div>

            {/* TRANSFER HISTORY */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                    <div className="flex items-center gap-2">

                        <ArrowRightLeft
                            size={20}
                            className="text-slate-600"
                        />

                        <div>

                            <h2 className="font-bold text-slate-900">
                                Transfer History
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Transfers related to
                                this warehouse
                            </p>

                        </div>

                    </div>

                </div>

                {warehouseTransfers.length ===
                0 ? (
                    <div className="flex min-h-[250px] flex-col items-center justify-center text-center">

                        <ArrowRightLeft
                            size={30}
                            className="text-slate-300"
                        />

                        <p className="mt-3 text-sm font-semibold text-slate-600">
                            No transfer history
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            No transfers have been
                            recorded for this
                            warehouse.
                        </p>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[900px]">

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

                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500">
                                        QTY
                                    </th>

                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500">
                                        STATUS
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        DATE
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {warehouseTransfers.map(
                                    (
                                        transfer
                                    ) => {

                                        const isIncoming =
                                            String(
                                                transfer.destinationWarehouseId
                                            ) ===
                                            String(
                                                warehouse.id
                                            );

                                        return (
                                            <tr
                                                key={
                                                    transfer.id
                                                }
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                            >

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">

                                                            <Package
                                                                size={
                                                                    16
                                                                }
                                                                className="text-slate-500"
                                                            />

                                                        </div>

                                                        <div>

                                                            <p className="text-sm font-bold text-slate-900">
                                                                {
                                                                    transfer.productName ||
                                                                    transfer.product?.name ||
                                                                    "Product"
                                                                }
                                                            </p>

                                                            <p className="text-xs text-slate-400">
                                                                {transfer.reason ||
                                                                    "Stock Transfer"}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>

                                                <td className="px-6 py-5">

                                                    <span className="text-sm text-slate-600">
                                                        {
                                                            transfer.sourceWarehouseName ||
                                                            transfer.fromWarehouseName ||
                                                            transfer.sourceWarehouse ||
                                                            "—"
                                                        }
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5">

                                                    <span className="text-sm text-slate-600">
                                                        {
                                                            transfer.destinationWarehouseName ||
                                                            transfer.toWarehouseName ||
                                                            transfer.destinationWarehouse ||
                                                            "—"
                                                        }
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5 text-center">

                                                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                                                        {
                                                            formatNumber(
                                                                transfer.quantity
                                                            )
                                                        }
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5 text-center">

                                                    <span className="inline-flex items-center gap-1.5">

                                                        <span
                                                            className={
                                                                isIncoming
                                                                    ? "h-2 w-2 rounded-full bg-emerald-500"
                                                                    : "h-2 w-2 rounded-full bg-blue-500"
                                                            }
                                                        />

                                                        <span className="text-xs font-semibold text-slate-600">

                                                            {isIncoming
                                                                ? "INCOMING"
                                                                : "OUTGOING"}

                                                        </span>

                                                    </span>

                                                </td>

                                                <td className="px-6 py-5">

                                                    <span className="text-sm text-slate-500">
                                                        {formatDate(
                                                            transfer.transferDate ||
                                                                transfer.createdAt
                                                        )}
                                                    </span>

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

            {/* CREATED INFORMATION */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h2 className="font-bold text-slate-900">
                    Warehouse Information
                </h2>

                <div className="mt-5 grid gap-5 md:grid-cols-3">

                    <DetailItem
                        icon={
                            CalendarDays
                        }
                        label="Created"
                        value={formatDate(
                            warehouse.createdAt
                        )}
                    />

                    <DetailItem
                        icon={
                            CalendarDays
                        }
                        label="Last Updated"
                        value={formatDate(
                            warehouse.updatedAt
                        )}
                    />

                    <DetailItem
                        icon={User}
                        label="Manager"
                        value={
                            manager
                        }
                    />

                </div>

            </div>

        </div>
    );
}

/*
 * =========================================
 * DETAIL ITEM
 * =========================================
 */

function DetailItem({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div>

            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">

                <Icon size={14} />

                {label}

            </div>

            <p className="mt-2 break-words text-sm font-semibold text-slate-700">
                {value}
            </p>

        </div>
    );
}

/*
 * =========================================
 * STAT
 * =========================================
 */

function WarehouseStat({
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

                    <p className="mt-2 text-xl font-bold text-slate-900">
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