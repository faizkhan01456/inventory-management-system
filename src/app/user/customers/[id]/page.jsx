"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Users,
    Phone,
    Mail,
    MapPin,
    FileText,
    CalendarDays,
    ShoppingBag,
    IndianRupee,
    Edit,
    UserCheck,
    UserX,
    Receipt,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

export default function CustomerDetailsPage({
    params,
}) {
    const [customer, setCustomer] =
        useState(null);

    const [sales, setSales] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        const loadCustomer =
            async () => {
                const resolvedParams =
                    await params;

                const customers =
                    getStorage(
                        STORAGE_KEYS.CUSTOMERS,
                        []
                    );

                const storedSales =
                    getStorage(
                        STORAGE_KEYS.SALES,
                        []
                    );

                const found =
                    Array.isArray(
                        customers
                    )
                        ? customers.find(
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

                setCustomer(
                    found || null
                );

                setSales(
                    Array.isArray(
                        storedSales
                    )
                        ? storedSales
                        : []
                );

                setLoading(false);
            };

        loadCustomer();
    }, [params]);

    /*
     * ========================================
     * CUSTOMER SALES
     * ========================================
     */

    const customerSales =
        useMemo(() => {
            if (!customer) {
                return [];
            }

            return sales
                .filter(
                    (sale) =>
                        String(
                            sale.customerId
                        ) ===
                        String(
                            customer.id
                        )
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        new Date(
                            b.saleDate ||
                                b.createdAt ||
                                0
                        ) -
                        new Date(
                            a.saleDate ||
                                a.createdAt ||
                                0
                        )
                );
        }, [
            customer,
            sales,
        ]);

    /*
     * ========================================
     * STATS
     * ========================================
     */

    const totalOrders =
        customerSales.length;

    const totalPurchaseValue =
        customerSales.reduce(
            (
                total,
                sale
            ) =>
                total +
                Number(
                    sale.grandTotal ||
                        sale.totalAmount ||
                        sale.total ||
                        0
                ),
            0
        );

    const completedOrders =
        customerSales.filter(
            (sale) =>
                String(
                    sale.status ||
                        "COMPLETED"
                ).toUpperCase() ===
                "COMPLETED"
        ).length;

    const averageOrderValue =
        totalOrders > 0
            ? totalPurchaseValue /
              totalOrders
            : 0;

    /*
     * ========================================
     * FORMAT
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
        if (!customer) {
            return;
        }

        const customers =
            getStorage(
                STORAGE_KEYS.CUSTOMERS,
                []
            );

        const currentStatus =
            String(
                customer.status ||
                    "ACTIVE"
            ).toUpperCase();

        const newStatus =
            currentStatus ===
            "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const updatedCustomers =
            Array.isArray(
                customers
            )
                ? customers.map(
                      (
                          item
                      ) =>
                          item.id ===
                          customer.id
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
            STORAGE_KEYS.CUSTOMERS,
            updatedCustomers
        );

        setCustomer(
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
                        Loading customer...
                    </p>

                </div>

            </div>
        );
    }

    if (!customer) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                        <Users
                            size={28}
                            className="text-slate-400"
                        />

                    </div>

                    <h2 className="mt-4 text-xl font-bold text-slate-900">
                        Customer Not Found
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        The customer you're
                        looking for does not
                        exist.
                    </p>

                    <Link
                        href="/user/customers"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        <ArrowLeft size={17} />
                        Back to Customers
                    </Link>

                </div>

            </div>
        );
    }

    const status =
        String(
            customer.status ||
                "ACTIVE"
        ).toUpperCase();

    return (
        <div className="space-y-6">

            {/* HEADER */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div className="flex items-center gap-3">

                    <Link
                        href="/user/customers"
                        className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <div>

                        <div className="flex items-center gap-2">

                            <Users
                                size={24}
                                className="text-slate-700"
                            />

                            <h1 className="text-2xl font-bold text-slate-900">
                                Customer Details
                            </h1>

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            {
                                customer.name ||
                                customer.customerName
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
                        href="/user/customers"
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        <Users size={17} />
                        All Customers
                    </Link>

                </div>

            </div>

            {/* CUSTOMER PROFILE */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 p-6">

                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                        <div className="flex items-center gap-4">

                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-600">

                                {(
                                    customer.name ||
                                    customer.customerName ||
                                    "C"
                                )
                                    .charAt(
                                        0
                                    )
                                    .toUpperCase()}

                            </div>

                            <div>

                                <h2 className="text-xl font-bold text-slate-900">
                                    {
                                        customer.name ||
                                        customer.customerName ||
                                        "Customer"
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

                                    {customer.gstNumber && (
                                        <span className="text-xs font-medium text-slate-400">
                                            GST:{" "}
                                            {
                                                customer.gstNumber
                                            }
                                        </span>
                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                {/* CONTACT DETAILS */}

                <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-4">

                    <DetailItem
                        icon={
                            Phone
                        }
                        label="Phone"
                        value={
                            customer.phone ||
                            customer.mobile ||
                            "—"
                        }
                    />

                    <DetailItem
                        icon={
                            Mail
                        }
                        label="Email"
                        value={
                            customer.email ||
                            "—"
                        }
                    />

                    <DetailItem
                        icon={
                            MapPin
                        }
                        label="Location"
                        value={
                            [
                                customer.city,
                                customer.state,
                                customer.pincode,
                            ]
                                .filter(
                                    Boolean
                                )
                                .join(
                                    ", "
                                ) ||
                            "—"
                        }
                    />

                    <DetailItem
                        icon={
                            CalendarDays
                        }
                        label="Created"
                        value={formatDate(
                            customer.createdAt
                        )}
                    />

                </div>

            </div>

            {/* ADDRESS / NOTES */}

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
                                customer.address,
                                customer.city,
                                customer.state,
                                customer.pincode,
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
                            {customer.notes ||
                                "No notes added."}
                        </p>

                    </div>

                </div>

            </div>

            {/* STATS */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <CustomerStat
                    title="Total Orders"
                    value={
                        totalOrders
                    }
                    subtitle="All sales"
                    icon={
                        ShoppingBag
                    }
                />

                <CustomerStat
                    title="Completed Orders"
                    value={
                        completedOrders
                    }
                    subtitle="Completed sales"
                    icon={
                        Receipt
                    }
                />

                <CustomerStat
                    title="Total Purchase"
                    value={formatCurrency(
                        totalPurchaseValue
                    )}
                    subtitle="Customer sales value"
                    icon={
                        IndianRupee
                    }
                />

                <CustomerStat
                    title="Average Order"
                    value={formatCurrency(
                        averageOrderValue
                    )}
                    subtitle="Average sale value"
                    icon={
                        IndianRupee
                    }
                />

            </div>

            {/* SALES HISTORY */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                    <div className="flex items-center gap-2">

                        <ShoppingBag
                            size={20}
                            className="text-slate-600"
                        />

                        <div>

                            <h2 className="font-bold text-slate-900">
                                Sales History
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                All sales made by
                                this customer
                            </p>

                        </div>

                    </div>

                </div>

                {customerSales.length ===
                0 ? (
                    <div className="flex min-h-[250px] flex-col items-center justify-center text-center">

                        <ShoppingBag
                            size={30}
                            className="text-slate-300"
                        />

                        <p className="mt-3 text-sm font-semibold text-slate-600">
                            No sales found
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            This customer has
                            no linked sales yet.
                        </p>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[900px]">

                            <thead>

                                <tr className="border-b border-slate-200 bg-slate-50">

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        SALE
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

                                {customerSales.map(
                                    (
                                        sale
                                    ) => {

                                        const items =
                                            sale.items ||
                                            sale.products ||
                                            [];

                                        const amount =
                                            Number(
                                                sale.grandTotal ||
                                                    sale.totalAmount ||
                                                    sale.total ||
                                                    0
                                            );

                                        const saleStatus =
                                            String(
                                                sale.status ||
                                                    "COMPLETED"
                                            ).toUpperCase();

                                        return (
                                            <tr
                                                key={
                                                    sale.id
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
                                                                    sale.saleNumber ||
                                                                    sale.invoiceNumber ||
                                                                    sale.id
                                                                }
                                                            </p>

                                                            <p className="text-xs text-slate-400">
                                                                {
                                                                    sale.invoiceNumber
                                                                        ? `Invoice: ${sale.invoiceNumber}`
                                                                        : "Sale"
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>

                                                <td className="px-6 py-5">

                                                    <span className="text-sm text-slate-500">
                                                        {formatDate(
                                                            sale.saleDate ||
                                                                sale.date ||
                                                                sale.createdAt
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
                                                            sale.paymentMethod ||
                                                            sale.paymentStatus ||
                                                            "—"
                                                        }
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5 text-center">

                                                    <span
                                                        className={
                                                            saleStatus ===
                                                            "COMPLETED"
                                                                ? "rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600"
                                                                : saleStatus ===
                                                                  "CANCELLED"
                                                                ? "rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600"
                                                                : "rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600"
                                                        }
                                                    >
                                                        {
                                                            saleStatus
                                                        }
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5 text-right">

                                                    <Link
                                                        href={`/user/sales/${sale.id}`}
                                                        className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                                        title="View Sale"
                                                    >
                                                        <FileText
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </Link>

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

function CustomerStat({
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