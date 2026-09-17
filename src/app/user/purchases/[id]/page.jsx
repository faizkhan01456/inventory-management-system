"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ShoppingCart,
    Package,
    Truck,
    FileText,
    CalendarDays,
    CreditCard,
    CheckCircle2,
    Clock3,
    XCircle,
    IndianRupee,
} from "lucide-react";

import {
    getStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

export default function PurchaseDetailsPage({
    params,
}) {
    const [purchase, setPurchase] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [purchaseId, setPurchaseId] =
        useState(null);

    useEffect(() => {
        const load = async () => {
            const resolvedParams =
                await params;

            setPurchaseId(
                resolvedParams.id
            );

            const purchases =
                getStorage(
                    STORAGE_KEYS.PURCHASES,
                    []
                );

            const found =
                Array.isArray(purchases)
                    ? purchases.find(
                          (item) =>
                              String(
                                  item.id
                              ) ===
                              String(
                                  resolvedParams.id
                              )
                      )
                    : null;

            setPurchase(found || null);
            setLoading(false);
        };

        load();
    }, [params]);

    const formatCurrency = (
        amount
    ) => {
        return `₹${Number(
            amount || 0
        ).toLocaleString("en-IN")}`;
    };

    const formatDate = (
        date
    ) => {
        if (!date) return "—";

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
                month: "long",
                year: "numeric",
            }
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading purchase...
                    </p>

                </div>

            </div>
        );
    }

    if (!purchase) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                        <FileText
                            size={28}
                            className="text-slate-400"
                        />

                    </div>

                    <h2 className="mt-4 text-xl font-bold text-slate-900">
                        Purchase Not Found
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        The purchase you're
                        looking for does not
                        exist.
                    </p>

                    <Link
                        href="/user/purchases"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        <ArrowLeft size={17} />
                        Back to Purchases
                    </Link>

                </div>

            </div>
        );
    }

    const items =
        purchase.items ||
        purchase.products ||
        [];

    const status =
        String(
            purchase.status ||
                "PENDING"
        ).toUpperCase();

    return (
        <div className="space-y-6">

            {/* HEADER */}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div className="flex items-center gap-3">

                    <Link
                        href="/user/purchases"
                        className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <div>

                        <div className="flex items-center gap-2">

                            <ShoppingCart
                                size={24}
                                className="text-slate-700"
                            />

                            <h1 className="text-2xl font-bold text-slate-900">
                                Purchase Details
                            </h1>

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            {purchase.purchaseNumber ||
                                purchase.invoiceNumber ||
                                purchase.id}
                        </p>

                    </div>

                </div>

                <PurchaseStatus
                    status={status}
                />

            </div>

            {/* BASIC INFORMATION */}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

                <InfoCard
                    icon={FileText}
                    label="Purchase Number"
                    value={
                        purchase.purchaseNumber ||
                        purchase.id
                    }
                />

                <InfoCard
                    icon={FileText}
                    label="Invoice Number"
                    value={
                        purchase.invoiceNumber ||
                        "—"
                    }
                />

                <InfoCard
                    icon={CalendarDays}
                    label="Purchase Date"
                    value={formatDate(
                        purchase.purchaseDate ||
                            purchase.date ||
                            purchase.createdAt
                    )}
                />

                <InfoCard
                    icon={CreditCard}
                    label="Payment Method"
                    value={
                        purchase.paymentMethod ||
                        "—"
                    }
                />

            </div>

            {/* SUPPLIER */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                    <div className="flex items-center gap-2">

                        <Truck
                            size={20}
                            className="text-slate-600"
                        />

                        <h2 className="font-bold text-slate-900">
                            Supplier Information
                        </h2>

                    </div>

                </div>

                <div className="grid gap-5 p-6 md:grid-cols-3">

                    <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Supplier
                        </p>

                        <p className="mt-2 text-sm font-bold text-slate-900">
                            {
                                purchase.supplierName ||
                                "Unknown Supplier"
                            }
                        </p>

                    </div>

                    <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Phone
                        </p>

                        <p className="mt-2 text-sm font-semibold text-slate-700">
                            {
                                purchase.supplierPhone ||
                                "—"
                            }
                        </p>

                    </div>

                    <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Email
                        </p>

                        <p className="mt-2 break-all text-sm font-semibold text-slate-700">
                            {
                                purchase.supplierEmail ||
                                "—"
                            }
                        </p>

                    </div>

                </div>

            </div>

            {/* PRODUCTS */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                    <div className="flex items-center gap-2">

                        <Package
                            size={20}
                            className="text-slate-600"
                        />

                        <div>

                            <h2 className="font-bold text-slate-900">
                                Purchased Products
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                {items.length} product
                                {items.length !== 1
                                    ? "s"
                                    : ""}
                            </p>

                        </div>

                    </div>

                </div>

                {items.length === 0 ? (
                    <div className="p-10 text-center">

                        <Package
                            size={30}
                            className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm text-slate-500">
                            No products found
                            in this purchase.
                        </p>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[750px]">

                            <thead>

                                <tr className="border-b border-slate-200 bg-slate-50">

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        PRODUCT
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        SKU
                                    </th>

                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500">
                                        QTY
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        PURCHASE PRICE
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        TOTAL
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {items.map(
                                    (
                                        item,
                                        index
                                    ) => {

                                        const quantity =
                                            Number(
                                                item.quantity ||
                                                    0
                                            );

                                        const price =
                                            Number(
                                                item.purchasePrice ||
                                                    0
                                            );

                                        const total =
                                            Number(
                                                item.total ??
                                                    quantity *
                                                        price
                                            );

                                        return (
                                            <tr
                                                key={
                                                    item.id ||
                                                    `${item.productId}-${index}`
                                                }
                                                className="border-b border-slate-100 last:border-0"
                                            >

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">

                                                            <Package
                                                                size={
                                                                    17
                                                                }
                                                                className="text-slate-500"
                                                            />

                                                        </div>

                                                        <span className="text-sm font-semibold text-slate-800">
                                                            {
                                                                item.productName ||
                                                                "Product"
                                                            }
                                                        </span>

                                                    </div>

                                                </td>

                                                <td className="px-6 py-5">

                                                    <span className="text-sm text-slate-500">
                                                        {item.sku ||
                                                            "—"}
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5 text-center">

                                                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                                                        {
                                                            quantity
                                                        }{" "}
                                                        {item.unit ||
                                                            "pcs"}
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5 text-right">

                                                    <span className="text-sm text-slate-700">
                                                        {formatCurrency(
                                                            price
                                                        )}
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5 text-right">

                                                    <span className="text-sm font-bold text-slate-900">
                                                        {formatCurrency(
                                                            total
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

            {/* SUMMARY */}

            <div className="grid gap-6 lg:grid-cols-2">

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
                            {purchase.notes ||
                                "No notes added for this purchase."}
                        </p>

                    </div>

                </div>

                {/* TOTAL */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-2">

                        <IndianRupee
                            size={20}
                            className="text-slate-600"
                        />

                        <h2 className="font-bold text-slate-900">
                            Purchase Summary
                        </h2>

                    </div>

                    <div className="mt-6 space-y-4">

                        <SummaryRow
                            label="Subtotal"
                            value={formatCurrency(
                                purchase.subtotal
                            )}
                        />

                        <SummaryRow
                            label="Discount"
                            value={`- ${formatCurrency(
                                purchase.discount
                            )}`}
                        />

                        <SummaryRow
                            label={`Tax (${Number(
                                purchase.tax ||
                                    0
                            )}%)`}
                            value={formatCurrency(
                                purchase.taxAmount
                            )}
                        />

                        <div className="border-t border-slate-200 pt-4">

                            <div className="flex items-center justify-between">

                                <span className="text-base font-bold text-slate-900">
                                    Grand Total
                                </span>

                                <span className="text-2xl font-bold text-slate-900">
                                    {formatCurrency(
                                        purchase.grandTotal
                                    )}
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

/*
 * =========================================
 * INFO CARD
 * =========================================
 */

function InfoCard({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-start gap-3">

                <div className="rounded-xl bg-slate-100 p-3 text-slate-600">

                    <Icon size={19} />

                </div>

                <div className="min-w-0">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {label}
                    </p>

                    <p className="mt-2 truncate text-sm font-bold text-slate-800">
                        {value}
                    </p>

                </div>

            </div>

        </div>
    );
}

/*
 * =========================================
 * SUMMARY ROW
 * =========================================
 */

function SummaryRow({
    label,
    value,
}) {
    return (
        <div className="flex items-center justify-between text-sm">

            <span className="text-slate-500">
                {label}
            </span>

            <span className="font-semibold text-slate-800">
                {value}
            </span>

        </div>
    );
}

/*
 * =========================================
 * STATUS
 * =========================================
 */

function PurchaseStatus({
    status,
}) {
    const normalized =
        String(
            status || "PENDING"
        ).toUpperCase();

    if (normalized === "COMPLETED") {
        return (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-600">

                <CheckCircle2
                    size={15}
                />

                COMPLETED

            </span>
        );
    }

    if (normalized === "CANCELLED") {
        return (
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-600">

                <XCircle
                    size={15}
                />

                CANCELLED

            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-xs font-bold text-amber-600">

            <Clock3 size={15} />

            PENDING

        </span>
    );
}