"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useParams } from "next/navigation";

import {
    ArrowLeft,
    Building2,
    User,
    Mail,
    Phone,
    Calendar,
    CreditCard,
    Package,
    ShoppingCart,
    IndianRupee,
    Power,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

import {
    businesses as demoBusinesses,
    products,
    sales,
    purchases,
} from "@/data/demoData";

export default function BusinessDetailPage() {
    const params = useParams();

    const [business, setBusiness] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        if (!params?.id) {
            setLoading(false);
            return;
        }

        const storedBusinesses =
            getStorage(
                STORAGE_KEYS.BUSINESSES,
                demoBusinesses
            );

        const foundBusiness =
            storedBusinesses.find(
                (item) =>
                    String(item.id) ===
                    String(params.id)
            );

        setBusiness(
            foundBusiness || null
        );

        setLoading(false);
    }, [params?.id]);

    /*
     * Loading
     */

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading business...
                    </p>
                </div>
            </div>
        );
    }

    /*
     * Not found
     */

    if (!business) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                        <Building2
                            size={26}
                            className="text-slate-400"
                        />
                    </div>

                    <h2 className="mt-4 text-lg font-bold text-slate-900">
                        Business Not Found
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        The business you are
                        looking for does not
                        exist.
                    </p>

                    <Link
                        href="/admin/businesses"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <ArrowLeft
                            size={16}
                        />

                        Back to Businesses
                    </Link>
                </div>
            </div>
        );
    }

    /*
     * Demo statistics
     *
     * Later these will be filtered by businessId.
     */

    const businessProducts =
        products.filter(
            (product) =>
                !product.businessId ||
                product.businessId ===
                    business.id
        );

    const businessSales =
        sales.filter(
            (sale) =>
                !sale.businessId ||
                sale.businessId ===
                    business.id
        );

    const businessPurchases =
        purchases.filter(
            (purchase) =>
                !purchase.businessId ||
                purchase.businessId ===
                    business.id
        );

    const totalRevenue =
        businessSales.reduce(
            (sum, sale) =>
                sum +
                Number(
                    sale.total || 0
                ),
            0
        );

    /*
     * Toggle status
     */

    const handleToggleStatus =
        () => {
            const storedBusinesses =
                getStorage(
                    STORAGE_KEYS.BUSINESSES,
                    demoBusinesses
                );

            const updatedBusinesses =
                storedBusinesses.map(
                    (item) => {
                        if (
                            item.id !==
                            business.id
                        ) {
                            return item;
                        }

                        return {
                            ...item,
                            status:
                                item.status ===
                                "ACTIVE"
                                    ? "INACTIVE"
                                    : "ACTIVE",
                        };
                    }
                );

            setStorage(
                STORAGE_KEYS.BUSINESSES,
                updatedBusinesses
            );

            const updatedBusiness =
                updatedBusinesses.find(
                    (item) =>
                        item.id ===
                        business.id
                );

            setBusiness(
                updatedBusiness
            );
        };

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            {/* BACK */}

            <Link
                href="/admin/businesses"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
                <ArrowLeft
                    size={16}
                />

                Back to Businesses
            </Link>

            {/* HEADER */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-slate-900 p-6 md:p-8">
                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white">
                                <Building2
                                    size={30}
                                />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {
                                        business.name
                                    }
                                </h1>

                                <p className="mt-1 text-sm text-slate-300">
                                    {
                                        business.email
                                    }
                                </p>

                                <div className="mt-3">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                                            business.status ===
                                            "ACTIVE"
                                                ? "bg-emerald-400/10 text-emerald-300"
                                                : "bg-red-400/10 text-red-300"
                                        }`}
                                    >
                                        {
                                            business.status
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={
                                handleToggleStatus
                            }
                            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                business.status ===
                                "ACTIVE"
                                    ? "bg-red-500/10 text-red-300 hover:bg-red-500/20"
                                    : "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                            }`}
                        >
                            <Power
                                size={17}
                            />

                            {business.status ===
                            "ACTIVE"
                                ? "Deactivate"
                                : "Activate"}
                        </button>
                    </div>
                </div>

                {/* BUSINESS INFORMATION */}

                <div className="p-6 md:p-8">
                    <h2 className="text-lg font-bold text-slate-900">
                        Business Information
                    </h2>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoCard
                            icon={User}
                            label="Owner"
                            value={
                                business.ownerName
                            }
                        />

                        <InfoCard
                            icon={Mail}
                            label="Email"
                            value={
                                business.email ||
                                "Not provided"
                            }
                        />

                        <InfoCard
                            icon={Phone}
                            label="Phone"
                            value={
                                business.phone ||
                                "Not provided"
                            }
                        />

                        <InfoCard
                            icon={CreditCard}
                            label="Plan"
                            value={
                                business.plan ||
                                "BASIC"
                            }
                        />

                        <InfoCard
                            icon={Calendar}
                            label="Created"
                            value={
                                business.createdAt ||
                                "—"
                            }
                        />

                        <InfoCard
                            icon={Building2}
                            label="Business ID"
                            value={
                                business.id
                            }
                        />
                    </div>
                </div>
            </div>

            {/* STATS */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={Package}
                    label="Products"
                    value={
                        businessProducts.length
                    }
                />

                <StatCard
                    icon={ShoppingCart}
                    label="Sales"
                    value={
                        businessSales.length
                    }
                />

                <StatCard
                    icon={CreditCard}
                    label="Purchases"
                    value={
                        businessPurchases.length
                    }
                />

                <StatCard
                    icon={IndianRupee}
                    label="Revenue"
                    value={`₹${totalRevenue.toLocaleString(
                        "en-IN"
                    )}`}
                />
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| INFO CARD
|--------------------------------------------------------------------------
*/

function InfoCard({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Icon
                        size={18}
                    />
                </div>

                <div className="min-w-0">
                    <p className="text-xs text-slate-400">
                        {label}
                    </p>

                    <p className="mt-1 break-words text-sm font-bold text-slate-900">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function StatCard({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-400">
                        {label}
                    </p>

                    <p className="mt-2 text-xl font-bold text-slate-900">
                        {value}
                    </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Icon
                        size={19}
                    />
                </div>
            </div>
        </div>
    );
}