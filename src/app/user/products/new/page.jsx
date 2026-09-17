"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    ArrowLeft,
    Package,
    Save,
    RefreshCw,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

const defaultCategories = [
    "Electronics",
    "Accessories",
    "Clothing",
    "Grocery",
    "Furniture",
    "Stationery",
    "Other",
];

export default function NewProductPage() {
    const router = useRouter();

    const [categories, setCategories] =
        useState(defaultCategories);

    const [form, setForm] = useState({
        name: "",
        sku: "",
        category: "",
        purchasePrice: "",
        sellingPrice: "",
        stock: "",
        minStock: "10",
        unit: "PCS",
        tax: "18",
        description: "",
        status: "ACTIVE",
    });

    const [errors, setErrors] = useState({});

    const [saving, setSaving] =
        useState(false);

    /*
     * =========================================
     * LOAD CATEGORIES
     * =========================================
     */

    useEffect(() => {
        const storedCategories =
            getStorage(
                STORAGE_KEYS.CATEGORIES,
                null
            );

        if (
            Array.isArray(
                storedCategories
            ) &&
            storedCategories.length > 0
        ) {
            const categoryNames =
                storedCategories
                    .map((category) => {
                        if (
                            typeof category ===
                            "string"
                        ) {
                            return category;
                        }

                        return category?.name;
                    })
                    .filter(Boolean);

            if (
                categoryNames.length > 0
            ) {
                setCategories(
                    categoryNames
                );
            }
        }
    }, []);

    /*
     * =========================================
     * HANDLE CHANGE
     * =========================================
     */

    const handleChange = (
        field,
        value
    ) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [field]: "",
        }));
    };

    /*
     * =========================================
     * GENERATE SKU
     * =========================================
     */

    const generateSKU = () => {
        const randomNumber =
            Math.floor(
                1000 +
                    Math.random() *
                        9000
            );

        handleChange(
            "sku",
            `PROD-${randomNumber}`
        );
    };

    /*
     * =========================================
     * VALIDATION
     * =========================================
     */

    const validate = () => {
        const newErrors = {};

        if (
            !form.name.trim()
        ) {
            newErrors.name =
                "Product name is required.";
        }

        if (
            !form.sku.trim()
        ) {
            newErrors.sku =
                "SKU is required.";
        }

        if (
            !form.category
        ) {
            newErrors.category =
                "Category is required.";
        }

        if (
            form.purchasePrice ===
                "" ||
            Number(
                form.purchasePrice
            ) < 0
        ) {
            newErrors.purchasePrice =
                "Enter a valid purchase price.";
        }

        if (
            form.sellingPrice ===
                "" ||
            Number(
                form.sellingPrice
            ) < 0
        ) {
            newErrors.sellingPrice =
                "Enter a valid selling price.";
        }

        if (
            form.stock === "" ||
            Number(form.stock) < 0
        ) {
            newErrors.stock =
                "Enter a valid stock quantity.";
        }

        if (
            form.minStock ===
                "" ||
            Number(
                form.minStock
            ) < 0
        ) {
            newErrors.minStock =
                "Enter a valid minimum stock.";
        }

        if (
            form.purchasePrice !==
                "" &&
            form.sellingPrice !==
                "" &&
            Number(
                form.sellingPrice
            ) <
                Number(
                    form.purchasePrice
                )
        ) {
            newErrors.sellingPrice =
                "Selling price should not be lower than purchase price.";
        }

        return newErrors;
    };

    /*
     * =========================================
     * SUBMIT
     * =========================================
     */

    const handleSubmit = (
        event
    ) => {
        event.preventDefault();

        const validationErrors =
            validate();

        if (
            Object.keys(
                validationErrors
            ).length > 0
        ) {
            setErrors(
                validationErrors
            );
            return;
        }

        setSaving(true);

        const existingProducts =
            getStorage(
                STORAGE_KEYS.PRODUCTS,
                []
            );

        const products =
            Array.isArray(
                existingProducts
            )
                ? existingProducts
                : [];

        /*
         * Check duplicate SKU
         */

        const duplicateSKU =
            products.some(
                (product) =>
                    String(
                        product.sku ||
                            ""
                    )
                        .trim()
                        .toLowerCase() ===
                    form.sku
                        .trim()
                        .toLowerCase()
            );

        if (duplicateSKU) {
            setErrors({
                sku: "This SKU already exists.",
            });

            setSaving(false);

            return;
        }

        /*
         * Create Product
         */

        const product = {
            id: `product_${Date.now()}`,

            name: form.name.trim(),

            sku: form.sku
                .trim()
                .toUpperCase(),

            category:
                form.category,

            purchasePrice:
                Number(
                    form.purchasePrice
                ),

            sellingPrice:
                Number(
                    form.sellingPrice
                ),

            stock:
                Number(
                    form.stock
                ),

            minStock:
                Number(
                    form.minStock
                ),

            unit:
                form.unit,

            tax:
                Number(
                    form.tax || 0
                ),

            description:
                form.description.trim(),

            status:
                form.status,

            createdAt:
                new Date().toISOString(),
        };

        const updatedProducts = [
            ...products,
            product,
        ];

        /*
         * Save to localStorage
         */

        setStorage(
            STORAGE_KEYS.PRODUCTS,
            updatedProducts
        );

        /*
         * Redirect to product
         */

        setTimeout(() => {
            router.push(
                `/user/products/${product.id}`
            );
        }, 300);
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">

            {/* =================================
                HEADER
            ================================== */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div className="flex items-center gap-4">

                    <Link
                        href="/user/products"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                    >
                        <ArrowLeft
                            size={18}
                        />
                    </Link>

                    <div>

                        <div className="flex items-center gap-2">

                            <Package
                                size={23}
                                className="text-slate-700"
                            />

                            <h1 className="text-2xl font-bold text-slate-900">
                                Add Product
                            </h1>

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Create a new product
                            for your inventory.
                        </p>

                    </div>

                </div>

            </div>

            {/* =================================
                FORM
            ================================== */}

            <form
                onSubmit={
                    handleSubmit
                }
                className="space-y-6"
            >

                {/* =================================
                    BASIC INFORMATION
                ================================== */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div>

                        <h2 className="text-base font-bold text-slate-900">
                            Basic Information
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Enter the basic
                            details of your
                            product.
                        </p>

                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-2">

                        {/* PRODUCT NAME */}

                        <div>

                            <label className="mb-2 block text-sm font-semibold text-slate-700">

                                Product Name

                                <span className="ml-1 text-red-500">
                                    *
                                </span>

                            </label>

                            <input
                                type="text"
                                value={
                                    form.name
                                }
                                onChange={(
                                    event
                                ) =>
                                    handleChange(
                                        "name",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="e.g. Wireless Mouse"
                                className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:bg-white ${
                                    errors.name
                                        ? "border-red-300"
                                        : "border-slate-200 focus:border-slate-400"
                                }`}
                            />

                            {errors.name && (
                                <p className="mt-1 text-xs text-red-500">
                                    {
                                        errors.name
                                    }
                                </p>
                            )}

                        </div>

                        {/* SKU */}

                        <div>

                            <label className="mb-2 block text-sm font-semibold text-slate-700">

                                SKU

                                <span className="ml-1 text-red-500">
                                    *
                                </span>

                            </label>

                            <div className="flex gap-2">

                                <input
                                    type="text"
                                    value={
                                        form.sku
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        handleChange(
                                            "sku",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="e.g. MS-WL-001"
                                    className={`h-12 min-w-0 flex-1 rounded-xl border bg-slate-50 px-4 text-sm uppercase text-slate-800 outline-none transition focus:bg-white ${
                                        errors.sku
                                            ? "border-red-300"
                                            : "border-slate-200 focus:border-slate-400"
                                    }`}
                                />

                                <button
                                    type="button"
                                    onClick={
                                        generateSKU
                                    }
                                    className="flex h-12 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                                >

                                    <RefreshCw
                                        size={
                                            15
                                        }
                                    />

                                    Generate

                                </button>

                            </div>

                            {errors.sku && (
                                <p className="mt-1 text-xs text-red-500">
                                    {
                                        errors.sku
                                    }
                                </p>
                            )}

                        </div>

                        {/* CATEGORY */}

                        <div>

                            <label className="mb-2 block text-sm font-semibold text-slate-700">

                                Category

                                <span className="ml-1 text-red-500">
                                    *
                                </span>

                            </label>

                            <select
                                value={
                                    form.category
                                }
                                onChange={(
                                    event
                                ) =>
                                    handleChange(
                                        "category",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:bg-white ${
                                    errors.category
                                        ? "border-red-300"
                                        : "border-slate-200 focus:border-slate-400"
                                }`}
                            >

                                <option value="">
                                    Select category
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

                            {errors.category && (
                                <p className="mt-1 text-xs text-red-500">
                                    {
                                        errors.category
                                    }
                                </p>
                            )}

                        </div>

                        {/* UNIT */}

                        <div>

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Unit
                            </label>

                            <select
                                value={
                                    form.unit
                                }
                                onChange={(
                                    event
                                ) =>
                                    handleChange(
                                        "unit",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white"
                            >

                                <option value="PCS">
                                    PCS
                                </option>

                                <option value="BOX">
                                    BOX
                                </option>

                                <option value="KG">
                                    KG
                                </option>

                                <option value="GRAM">
                                    GRAM
                                </option>

                                <option value="LITRE">
                                    LITRE
                                </option>

                                <option value="METER">
                                    METER
                                </option>

                                <option value="PACK">
                                    PACK
                                </option>

                                <option value="DOZEN">
                                    DOZEN
                                </option>

                            </select>

                        </div>

                    </div>

                </div>

                {/* =================================
                    PRICING & STOCK
                ================================== */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div>

                        <h2 className="text-base font-bold text-slate-900">
                            Pricing & Stock
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Configure pricing,
                            tax and stock
                            information.
                        </p>

                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-2">

                        {/* PURCHASE PRICE */}

                        <NumberField
                            label="Purchase Price"
                            required
                            value={
                                form.purchasePrice
                            }
                            onChange={(
                                value
                            ) =>
                                handleChange(
                                    "purchasePrice",
                                    value
                                )
                            }
                            placeholder="e.g. 500"
                            error={
                                errors.purchasePrice
                            }
                        />

                        {/* SELLING PRICE */}

                        <NumberField
                            label="Selling Price"
                            required
                            value={
                                form.sellingPrice
                            }
                            onChange={(
                                value
                            ) =>
                                handleChange(
                                    "sellingPrice",
                                    value
                                )
                            }
                            placeholder="e.g. 799"
                            error={
                                errors.sellingPrice
                            }
                        />

                        {/* OPENING STOCK */}

                        <NumberField
                            label="Opening Stock"
                            required
                            value={
                                form.stock
                            }
                            onChange={(
                                value
                            ) =>
                                handleChange(
                                    "stock",
                                    value
                                )
                            }
                            placeholder="e.g. 50"
                            error={
                                errors.stock
                            }
                        />

                        {/* MIN STOCK */}

                        <NumberField
                            label="Minimum Stock"
                            required
                            value={
                                form.minStock
                            }
                            onChange={(
                                value
                            ) =>
                                handleChange(
                                    "minStock",
                                    value
                                )
                            }
                            placeholder="e.g. 10"
                            error={
                                errors.minStock
                            }
                        />

                        {/* TAX */}

                        <NumberField
                            label="Tax (%)"
                            value={
                                form.tax
                            }
                            onChange={(
                                value
                            ) =>
                                handleChange(
                                    "tax",
                                    value
                                )
                            }
                            placeholder="e.g. 18"
                        />

                        {/* STATUS */}

                        <div>

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Status
                            </label>

                            <select
                                value={
                                    form.status
                                }
                                onChange={(
                                    event
                                ) =>
                                    handleChange(
                                        "status",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white"
                            >

                                <option value="ACTIVE">
                                    Active
                                </option>

                                <option value="INACTIVE">
                                    Inactive
                                </option>

                            </select>

                        </div>

                    </div>

                </div>

                {/* =================================
                    DESCRIPTION
                ================================== */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <h2 className="text-base font-bold text-slate-900">
                        Description
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        Add additional
                        information about
                        the product.
                    </p>

                    <textarea
                        value={
                            form.description
                        }
                        onChange={(
                            event
                        ) =>
                            handleChange(
                                "description",
                                event
                                    .target
                                    .value
                            )
                        }
                        rows={5}
                        placeholder="Enter product description..."
                        className="mt-5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400 focus:bg-white"
                    />

                </div>

                {/* =================================
                    BUTTONS
                ================================== */}

                <div className="flex justify-end gap-3 pb-6">

                    <Link
                        href="/user/products"
                        className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        disabled={
                            saving
                        }
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        {saving ? (
                            <>
                                <RefreshCw
                                    size={
                                        17
                                    }
                                    className="animate-spin"
                                />

                                Saving...
                            </>
                        ) : (
                            <>
                                <Save
                                    size={
                                        17
                                    }
                                />

                                Save Product
                            </>
                        )}

                    </button>

                </div>

            </form>

        </div>
    );
}

/* =========================================
   NUMBER FIELD
========================================= */

function NumberField({
    label,
    required = false,
    value,
    onChange,
    placeholder,
    error,
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

            <input
                type="number"
                min="0"
                step="0.01"
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                placeholder={
                    placeholder
                }
                className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm text-slate-800 outline-none focus:bg-white ${
                    error
                        ? "border-red-300"
                        : "border-slate-200 focus:border-slate-400"
                }`}
            />

            {error && (
                <p className="mt-1 text-xs text-red-500">
                    {error}
                </p>
            )}

        </div>
    );
}