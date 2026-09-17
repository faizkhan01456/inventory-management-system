"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    UsersRound,
    Phone,
    Mail,
    MapPin,
    Building2,
    CalendarDays,
    ShoppingCart,
    IndianRupee,
    Receipt,
    UserCheck,
    UserX,
    FileText,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

export default function SupplierDetailsPage({
    params,
}) {
    const [supplier, setSupplier] =
        useState(null);

    const [purchases, setPurchases] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        const loadSupplier =
            async () => {
                const resolvedParams =
                    await params;

                const suppliers =
                    getStorage(
                        STORAGE_KEYS.SUPPLIERS,
                        []
                    );

                const storedPurchases =
                    getStorage(
                        STORAGE_KEYS.PURCHASES,
                        []
                    );

                const found =
                    Array.isArray(
                        suppliers
                    )
                        ? suppliers.find(
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

                setSupplier(
                    found || null
                );

                setPurchases(
                    Array.isArray(
                        storedPurchases
                    )
                        ? storedPurchases
                        : []
                );

                setLoading(false);
            };

        loadSupplier();
    }, [params]);

    /*
     * ========================================
     * SUPPLIER PURCHASES
     * ========================================
     */

    const supplierPurchases =
        useMemo(() => {
            if (!supplier) {
                return [];
            }

            return purchases
                .filter(
                    (purchase) =>
                        String(
                            purchase.supplierId
                        ) ===
                        String(
                            supplier.id
                        )
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        new Date(
                            b.purchaseDate ||
                                b.date ||
                                b.createdAt ||
                                0
                        ) -
                        new Date(
                            a.purchaseDate ||
                                a.date ||
                                a.createdAt ||
                                0
                        )
                );
        }, [
            supplier,
            purchases,
        ]);

    /*
     * ========================================
     * STATS
     * ========================================
     */

    const totalPurchases =
        supplierPurchases.length;

    const totalPurchaseValue =
        supplierPurchases.reduce(
            (
                total,
                purchase
            ) =>
                total +
                Number(
                    purchase.grandTotal ??
                        purchase.totalAmount ??
                        purchase.total ??
                        0
                ),
            0
        );

    const completedPurchases =
        supplierPurchases.filter(
            (purchase) =>
                String(
                    purchase.status ||
                        "COMPLETED"
                ).toUpperCase() ===
                "COMPLETED"
        ).length;

    const averagePurchaseValue =
        totalPurchases > 0
            ? totalPurchaseValue /
              totalPurchases
            : 0;

    /*
     * ========================================
     * FORMAT CURRENCY
     * ========================================
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
     * ========================================
     * FORMAT DATE
     * ========================================
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
     * ========================================
     * TOGGLE STATUS
     * ========================================
     */

    const toggleStatus = () => {
        if (!supplier) {
            return;
        }

        const suppliers =
            getStorage(
                STORAGE_KEYS.SUPPLIERS,
                []
            );

        const currentStatus =
            String(
                supplier.status ||
                    "ACTIVE"
            ).toUpperCase();

        const newStatus =
            currentStatus ===
            "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const updatedSuppliers =
            Array.isArray(
                suppliers
            )
                ? suppliers.map(
                      (
                          item
                      ) =>
                          item.id ===
                          supplier.id
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
            STORAGE_KEYS.SUPPLIERS,
            updatedSuppliers
        );

        setSupplier(
            (previous) => ({
                ...previous,
                status:
                    newStatus,
            })
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading supplier...
                    </p>

                </div>

            </div>
        );
    }

    if (!supplier) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                        <UsersRound
                            size={28}
                            className="text-slate-400"
                        />

                    </div>

                    <h2 className="mt-4 text-xl font-bold text-slate-900">
                        Supplier Not Found
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        The supplier you're
                        looking for does not
                        exist.
                    </p>

                    <Link
                        href="/user/suppliers"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        <ArrowLeft
                            size={17}
                        />
                        Back to Suppliers
                    </Link>

                </div>

            </div>
        );
    }

    const status =
        String(
            supplier.status ||
                "ACTIVE"
        ).toUpperCase();

    return (
        <div className="space-y-6">

            {/* HEADER */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div className="flex items-center gap-3">

                    <Link
                        href="/user/suppliers"
                        className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <div>

                        <div className="flex items-center gap-2">

                            <UsersRound
                                size={24}
                                className="text-slate-700"
                            />

                            <h1 className="text-2xl font-bold text-slate-900">
                                Supplier Details
                            </h1>

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            {
                                supplier.name ||
                                supplier.supplierName ||
                                "Supplier"
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
                                    size={
                                        17
                                    }
                                />
                                Deactivate
                            </>
                        ) : (
                            <>
                                <UserCheck
                                    size={
                                        17
                                    }
                                />
                                Activate
                            </>
                        )}

                    </button>

                    <Link
                        href="/user/suppliers"
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        <UsersRound
                            size={17}
                        />
                        All Suppliers
                    </Link>

                </div>

            </div>

            {/* PROFILE */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 p-6">

                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                        <div className="flex items-center gap-4">

                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-600">

                                {(
                                    supplier.name ||
                                    supplier.supplierName ||
                                    "S"
                                )
                                    .charAt(
                                        0
                                    )
                                    .toUpperCase()}

                            </div>

                            <div>

                                <h2 className="text-xl font-bold text-slate-900">
                                    {
                                        supplier.name ||
                                        supplier.supplierName ||
                                        "Supplier"
                                    }
                                </h2>

                                <div className="mt-2 flex flex-wrap items-center gap-3">

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

                                    {supplier.gstNumber && (
                                        <span className="text-xs font-medium text-slate-400">
                                            GST:{" "}
                                            {
                                                supplier.gstNumber
                                            }
                                        </span>
                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                {/* CONTACT */}

                <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-4">

                    <DetailItem
                        icon={Building2}
                        label="Company"
                        value={
                            supplier.companyName ||
                            supplier.businessName ||
                            "—"
                        }
                    />

                    <DetailItem
                        icon={Phone}
                        label="Phone"
                        value={
                            supplier.phone ||
                            supplier.mobile ||
                            "—"
                        }
                    />

                    <DetailItem
                        icon={Mail}
                        label="Email"
                        value={
                            supplier.email ||
                            "—"
                        }
                    />

                    <DetailItem
                        icon={
                            CalendarDays
                        }
                        label="Created"
                        value={formatDate(
                            supplier.createdAt
                        )}
                    />

                </div>

            </div>

            {/* ADDRESS + NOTES */}

            <div className="grid gap-6 lg:grid-cols-2">

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-2">

                        <MapPin
                            size={20}
                            className="text-slate-600"
                        />

                        <h2 className="font-bold text-slate-900">
                            Address
                        </h2>

                    </div>

                    <div className="mt-5 rounded-xl bg-slate-50 p-4">

                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">

                            {[
                                supplier.address,
                                supplier.city,
                                supplier.state,
                                supplier.pincode,
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
                            {supplier.notes ||
                                "No notes added."}
                        </p>

                    </div>

                </div>

            </div>

            {/* STATS */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <SupplierStat
                    title="Total Purchases"
                    value={
                        totalPurchases
                    }
                    subtitle="Purchase orders"
                    icon={
                        ShoppingCart
                    }
                />

                <SupplierStat
                    title="Completed"
                    value={
                        completedPurchases
                    }
                    subtitle="Completed purchases"
                    icon={
                        Receipt
                    }
                />

                <SupplierStat
                    title="Purchase Value"
                    value={formatCurrency(
                        totalPurchaseValue
                    )}
                    subtitle="Total purchase value"
                    icon={
                        IndianRupee
                    }
                />

                <SupplierStat
                    title="Average Purchase"
                    value={formatCurrency(
                        averagePurchaseValue
                    )}
                    subtitle="Average purchase value"
                    icon={
                        IndianRupee
                    }
                />

            </div>

            {/* PURCHASE HISTORY */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                    <div className="flex items-center gap-2">

                        <ShoppingCart
                            size={20}
                            className="text-slate-600"
                        />

                        <div>

                            <h2 className="font-bold text-slate-900">
                                Purchase History
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                All purchases made
                                from this supplier
                            </p>

                        </div>

                    </div>

                </div>

                {supplierPurchases.length ===
                0 ? (
                    <div className="flex min-h-[250px] flex-col items-center justify-center text-center">

                        <ShoppingCart
                            size={30}
                            className="text-slate-300"
                        />

                        <p className="mt-3 text-sm font-semibold text-slate-600">
                            No purchases found
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            This supplier has
                            no purchase history
                            yet.
                        </p>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[950px]">

                            <thead>

                                <tr className="border-b border-slate-200 bg-slate-50">

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        PURCHASE
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        DATE
                                    </th>

                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500">
                                        ITEMS
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        AMOUNT
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        PAYMENT
                                    </th>

                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500">
                                        STATUS
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        ACTION
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {supplierPurchases.map(
                                    (
                                        purchase
                                    ) => {

                                        const items =
                                            purchase.items ||
                                            purchase.products ||
                                            [];

                                        const amount =
                                            Number(
                                                purchase.grandTotal ??
                                                    purchase.totalAmount ??
                                                    purchase.total ??
                                                    0
                                            );

                                        const purchaseStatus =
                                            String(
                                                purchase.status ||
                                                    "COMPLETED"
                                            ).toUpperCase();

                                        return (
                                            <tr
                                                key={
                                                    purchase.id
                                                }
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                            >

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">

                                                            <FileText
                                                                size={
                                                                    17
                                                                }
                                                                className="text-slate-500"
                                                            />

                                                        </div>

                                                        <div>

                                                            <p className="text-sm font-bold text-slate-900">
                                                                {
                                                                    purchase.purchaseNumber ||
                                                                    purchase.invoiceNumber ||
                                                                    purchase.id
                                                                }
                                                            </p>

                                                            <p className="text-xs text-slate-400">
                                                                Purchase
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>

                                                <td className="px-6 py-5">

                                                    <span className="text-sm text-slate-500">
                                                        {formatDate(
                                                            purchase.purchaseDate ||
                                                                purchase.date ||
                                                                purchase.createdAt
                                                        )}
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5 text-center">

                                                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                                                        {
                                                            items.length
                                                        }
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5 text-right">

                                                    <span className="text-sm font-bold text-slate-900">
                                                        {formatCurrency(
                                                            amount
                                                        )}
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5">

                                                    <span className="text-sm text-slate-600">
                                                        {
                                                            purchase.paymentMethod ||
                                                            purchase.paymentStatus ||
                                                            "—"
                                                        }
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5 text-center">

                                                    <span
                                                        className={
                                                            purchaseStatus ===
                                                            "COMPLETED"
                                                                ? "rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600"
                                                                : purchaseStatus ===
                                                                  "CANCELLED"
                                                                ? "rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600"
                                                                : "rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600"
                                                        }
                                                    >
                                                        {
                                                            purchaseStatus
                                                        }
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5 text-right">

                                                    {purchase.id && (
                                                        <Link
                                                            href={`/user/purchases/${purchase.id}`}
                                                            className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                                            title="View Purchase"
                                                        >
                                                            <FileText
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </Link>
                                                    )}

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

function SupplierStat({
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

                    <p className="mt-2 text-2xl font-bold text-slate-900">
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