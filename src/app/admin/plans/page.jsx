"use client";

import { useEffect, useState } from "react";

import {
    CreditCard,
    Check,
    Pencil,
    Power,
    Plus,
    RefreshCw,
    X,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

import { plans as demoPlans } from "@/data/demoData";

export default function PlansPage() {
    const [plans, setPlans] = useState([]);

    const [showForm, setShowForm] =
        useState(false);

    const [editingPlan, setEditingPlan] =
        useState(null);

    const [form, setForm] = useState({
        name: "",
        price: "",
        billingCycle: "MONTHLY",
        maxProducts: "",
        maxStaff: "",
        storage: "",
        features: "",
    });

    /*
     * LOAD PLANS
     */

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = () => {
        const storedPlans = getStorage(
            STORAGE_KEYS.PLANS,
            null
        );

        if (Array.isArray(storedPlans)) {
            setPlans(storedPlans);
            return;
        }

        setPlans(demoPlans);

        setStorage(
            STORAGE_KEYS.PLANS,
            demoPlans
        );
    };

    /*
     * OPEN CREATE
     */

    const openCreate = () => {
        setEditingPlan(null);

        setForm({
            name: "",
            price: "",
            billingCycle: "MONTHLY",
            maxProducts: "",
            maxStaff: "",
            storage: "",
            features: "",
        });

        setShowForm(true);
    };

    /*
     * OPEN EDIT
     */

    const openEdit = (plan) => {
        setEditingPlan(plan);

        setForm({
            name: plan.name || "",
            price: plan.price ?? "",
            billingCycle:
                plan.billingCycle ||
                "MONTHLY",
            maxProducts:
                plan.maxProducts ?? "",
            maxStaff:
                plan.maxStaff ?? "",
            storage:
                plan.storage || "",
            features:
                Array.isArray(
                    plan.features
                )
                    ? plan.features.join("\n")
                    : "",
        });

        setShowForm(true);
    };

    /*
     * CLOSE FORM
     */

    const closeForm = () => {
        setShowForm(false);
        setEditingPlan(null);
    };

    /*
     * INPUT CHANGE
     */

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /*
     * SAVE PLAN
     */

    const handleSubmit = (event) => {
        event.preventDefault();

        const name =
            form.name.trim();

        if (!name) {
            alert(
                "Plan name is required."
            );
            return;
        }

        if (
            form.price === "" ||
            Number(form.price) < 0
        ) {
            alert(
                "Please enter a valid price."
            );
            return;
        }

        /*
         * Convert features
         */

        const features =
            form.features
                .split("\n")
                .map((item) =>
                    item.trim()
                )
                .filter(Boolean);

        /*
         * UPDATE PLAN
         */

        if (editingPlan) {
            const updatedPlans =
                plans.map((plan) => {
                    if (
                        plan.id !==
                        editingPlan.id
                    ) {
                        return plan;
                    }

                    return {
                        ...plan,

                        name,

                        slug: name
                            .toLowerCase()
                            .replace(
                                /\s+/g,
                                "-"
                            ),

                        price:
                            Number(
                                form.price
                            ),

                        billingCycle:
                            form.billingCycle,

                        maxProducts:
                            Number(
                                form.maxProducts
                            ) || 0,

                        maxStaff:
                            Number(
                                form.maxStaff
                            ) || 0,

                        storage:
                            form.storage.trim(),

                        features,
                    };
                });

            setPlans(updatedPlans);

            setStorage(
                STORAGE_KEYS.PLANS,
                updatedPlans
            );

            closeForm();

            alert(
                "Plan updated successfully."
            );

            return;
        }

        /*
         * DUPLICATE PLAN CHECK
         */

        const exists = plans.some(
            (plan) =>
                plan.name
                    ?.trim()
                    .toLowerCase() ===
                name.toLowerCase()
        );

        if (exists) {
            alert(
                "Plan already exists."
            );
            return;
        }

        /*
         * CREATE PLAN
         */

        const newPlan = {
            id: `plan_${Date.now()}`,

            name,

            slug: name
                .toLowerCase()
                .replace(
                    /\s+/g,
                    "-"
                ),

            price:
                Number(
                    form.price
                ),

            billingCycle:
                form.billingCycle,

            maxProducts:
                Number(
                    form.maxProducts
                ) || 0,

            maxStaff:
                Number(
                    form.maxStaff
                ) || 0,

            storage:
                form.storage.trim(),

            features,

            status: "ACTIVE",

            createdAt:
                new Date()
                    .toISOString()
                    .split("T")[0],
        };

        const updatedPlans = [
            ...plans,
            newPlan,
        ];

        setPlans(updatedPlans);

        setStorage(
            STORAGE_KEYS.PLANS,
            updatedPlans
        );

        closeForm();

        alert(
            "Plan created successfully."
        );
    };

    /*
     * TOGGLE STATUS
     */

    const handleToggleStatus = (
        planId
    ) => {
        const plan = plans.find(
            (item) =>
                item.id === planId
        );

        if (!plan) {
            return;
        }

        const newStatus =
            plan.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const updatedPlans =
            plans.map((item) => {
                if (
                    item.id !== planId
                ) {
                    return item;
                }

                return {
                    ...item,
                    status: newStatus,
                };
            });

        setPlans(updatedPlans);

        setStorage(
            STORAGE_KEYS.PLANS,
            updatedPlans
        );
    };

    /*
     * REFRESH
     */

    const handleRefresh = () => {
        loadPlans();
    };

    const activePlans =
        plans.filter(
            (plan) =>
                plan.status ===
                "ACTIVE"
        ).length;

    const inactivePlans =
        plans.length -
        activePlans;

    return (
        <div className="space-y-6">

            {/* =================================
                HEADER
            ================================== */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>
                    <div className="flex items-center gap-2">

                        <CreditCard
                            size={24}
                            className="text-slate-700"
                        />

                        <h1 className="text-2xl font-bold text-slate-900">
                            Plans
                        </h1>

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Create and manage
                        subscription plans
                        for businesses.
                    </p>
                </div>

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={
                            handleRefresh
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
                            openCreate
                        }
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    >
                        <Plus
                            size={18}
                        />

                        Add Plan
                    </button>

                </div>

            </div>

            {/* =================================
                STATS
            ================================== */}

            <div className="grid gap-4 sm:grid-cols-3">

                <StatCard
                    label="Total Plans"
                    value={plans.length}
                />

                <StatCard
                    label="Active Plans"
                    value={activePlans}
                />

                <StatCard
                    label="Inactive Plans"
                    value={
                        inactivePlans
                    }
                />

            </div>

            {/* =================================
                PLAN CARDS
            ================================== */}

            <div className="grid gap-6 lg:grid-cols-3">

                {plans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        onEdit={
                            openEdit
                        }
                        onToggleStatus={
                            handleToggleStatus
                        }
                    />
                ))}

            </div>

            {/* =================================
                EMPTY STATE
            ================================== */}

            {plans.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

                    <CreditCard
                        size={40}
                        className="mx-auto text-slate-300"
                    />

                    <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        No plans found
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Create your first
                        subscription plan.
                    </p>

                    <button
                        type="button"
                        onClick={
                            openCreate
                        }
                        className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                    >
                        Add Plan
                    </button>

                </div>
            )}

            {/* =================================
                MODAL
            ================================== */}

            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">

                    <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        {/* MODAL HEADER */}

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {editingPlan
                                        ? "Edit Plan"
                                        : "Create Plan"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Configure plan
                                    pricing and
                                    features.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeForm
                                }
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X
                                    size={20}
                                />
                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="space-y-5 p-6"
                        >

                            <div className="grid gap-5 md:grid-cols-2">

                                {/* NAME */}

                                <FormField
                                    label="Plan Name"
                                    required
                                >
                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            form.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Enterprise"
                                        className="input-field"
                                    />
                                </FormField>

                                {/* PRICE */}

                                <FormField
                                    label="Monthly Price"
                                    required
                                >
                                    <input
                                        type="number"
                                        min="0"
                                        name="price"
                                        value={
                                            form.price
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="999"
                                        className="input-field"
                                    />
                                </FormField>

                                {/* BILLING */}

                                <FormField
                                    label="Billing Cycle"
                                >
                                    <select
                                        name="billingCycle"
                                        value={
                                            form.billingCycle
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="input-field"
                                    >
                                        <option value="MONTHLY">
                                            Monthly
                                        </option>

                                        <option value="YEARLY">
                                            Yearly
                                        </option>
                                    </select>
                                </FormField>

                                {/* PRODUCTS */}

                                <FormField
                                    label="Maximum Products"
                                >
                                    <input
                                        type="number"
                                        min="0"
                                        name="maxProducts"
                                        value={
                                            form.maxProducts
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="1000"
                                        className="input-field"
                                    />
                                </FormField>

                                {/* STAFF */}

                                <FormField
                                    label="Maximum Staff"
                                >
                                    <input
                                        type="number"
                                        min="0"
                                        name="maxStaff"
                                        value={
                                            form.maxStaff
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="5"
                                        className="input-field"
                                    />
                                </FormField>

                                {/* STORAGE */}

                                <FormField
                                    label="Storage"
                                >
                                    <input
                                        type="text"
                                        name="storage"
                                        value={
                                            form.storage
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="10 GB"
                                        className="input-field"
                                    />
                                </FormField>

                            </div>

                            {/* FEATURES */}

                            <FormField
                                label="Features"
                            >
                                <textarea
                                    name="features"
                                    value={
                                        form.features
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows={7}
                                    placeholder={`Product Management
Inventory Management
Sales Management
Reports`}
                                    className="input-field resize-none"
                                />

                                <p className="mt-1 text-xs text-slate-400">
                                    Enter one feature
                                    per line.
                                </p>
                            </FormField>

                            {/* ACTIONS */}

                            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                                <button
                                    type="button"
                                    onClick={
                                        closeForm
                                    }
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                    {editingPlan
                                        ? "Update Plan"
                                        : "Create Plan"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* =================================
                CUSTOM CSS
            ================================== */}

            <style jsx>{`
                .input-field {
                    width: 100%;
                    border-radius: 0.75rem;
                    border: 1px solid rgb(226 232 240);
                    background: white;
                    padding: 0.75rem 0.875rem;
                    font-size: 0.875rem;
                    color: rgb(15 23 42);
                    outline: none;
                }

                .input-field:focus {
                    border-color: rgb(100 116 139);
                    box-shadow:
                        0 0 0 3px
                        rgb(148 163 184 / 0.15);
                }
            `}</style>

        </div>
    );
}

/* =================================
   PLAN CARD
================================== */

function PlanCard({
    plan,
    onEdit,
    onToggleStatus,
}) {
    const isActive =
        plan.status === "ACTIVE";

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            {/* HEADER */}

            <div className="border-b border-slate-100 p-6">

                <div className="flex items-start justify-between">

                    <div>

                        <h2 className="text-xl font-bold text-slate-900">
                            {plan.name}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {plan.billingCycle ===
                            "YEARLY"
                                ? "Yearly billing"
                                : "Monthly billing"}
                        </p>

                    </div>

                    <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                            isActive
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-red-50 text-red-600"
                        }`}
                    >
                        {plan.status}
                    </span>

                </div>

                <div className="mt-5 flex items-end gap-1">

                    <span className="text-3xl font-bold text-slate-900">
                        ₹
                        {Number(
                            plan.price || 0
                        ).toLocaleString(
                            "en-IN"
                        )}
                    </span>

                    <span className="pb-1 text-sm text-slate-400">
                        /{" "}
                        {plan.billingCycle ===
                        "YEARLY"
                            ? "year"
                            : "month"}
                    </span>

                </div>

            </div>

            {/* LIMITS */}

            <div className="grid grid-cols-3 border-b border-slate-100">

                <LimitItem
                    label="Products"
                    value={
                        plan.maxProducts
                    }
                />

                <LimitItem
                    label="Staff"
                    value={
                        plan.maxStaff
                    }
                />

                <LimitItem
                    label="Storage"
                    value={
                        plan.storage ||
                        "-"
                    }
                />

            </div>

            {/* FEATURES */}

            <div className="flex-1 p-6">

                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Features
                </p>

                <div className="space-y-3">

                    {plan.features
                        ?.slice(0, 8)
                        .map(
                            (
                                feature,
                                index
                            ) => (
                                <div
                                    key={
                                        `${plan.id}-feature-${index}`
                                    }
                                    className="flex items-start gap-2"
                                >
                                    <div className="mt-0.5 rounded-full bg-emerald-50 p-1">
                                        <Check
                                            size={
                                                12
                                            }
                                            className="text-emerald-600"
                                        />
                                    </div>

                                    <span className="text-sm text-slate-600">
                                        {
                                            feature
                                        }
                                    </span>
                                </div>
                            )
                        )}

                </div>

            </div>

            {/* ACTIONS */}

            <div className="flex gap-2 border-t border-slate-100 p-5">

                <button
                    type="button"
                    onClick={() =>
                        onEdit(plan)
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    <Pencil
                        size={16}
                    />

                    Edit
                </button>

                <button
                    type="button"
                    onClick={() =>
                        onToggleStatus(
                            plan.id
                        )
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${
                        isActive
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    }`}
                >
                    <Power
                        size={16}
                    />

                    {isActive
                        ? "Disable"
                        : "Enable"}
                </button>

            </div>

        </div>
    );
}

/* =================================
   LIMIT ITEM
================================== */

function LimitItem({
    label,
    value,
}) {
    return (
        <div className="border-r border-slate-100 p-4 last:border-r-0">

            <p className="text-xs text-slate-400">
                {label}
            </p>

            <p className="mt-1 truncate text-sm font-bold text-slate-900">
                {value}
            </p>

        </div>
    );
}

/* =================================
   STAT CARD
================================== */

function StatCard({
    label,
    value,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
                {value}
            </p>

        </div>
    );
}

/* =================================
   FORM FIELD
================================== */

function FormField({
    label,
    required = false,
    children,
}) {
    return (
        <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}
            </label>

            {children}

        </div>
    );
}