"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import {
    ArrowLeft,
    Package,
    Pencil,
    Trash2,
    Save,
    RefreshCw,
    CheckCircle2,
    XCircle,
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

export default function ProductDetailPage() {
    const params = useParams();

    const router = useRouter();

    const searchParams =
        useSearchParams();

    const productId =
        params.id;

    const isEditMode =
        searchParams.get(
            "edit"
        ) === "true";

    const [product, setProduct] =
        useState(null);

    const [categories, setCategories] =
        useState(
            defaultCategories
        );

    const [form, setForm] =
        useState({});

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [errors, setErrors] =
        useState({});

    useEffect(() => {
        loadProduct();
    }, [productId]);

    const loadProduct = () => {
        const products =
            getStorage(
                STORAGE_KEYS.PRODUCTS,
                []
            );

        const foundProduct =
            Array.isArray(products)
                ? products.find(
                      (item) =>
                          String(
                              item.id
                          ) ===
                          String(
                              productId
                          )
                  )
                : null;

        if (!foundProduct) {
            setProduct(null);
            setLoading(false);
            return;
        }

        setProduct(
            foundProduct
        );

        setForm({
            name:
                foundProduct.name ||
                "",
            sku:
                foundProduct.sku ||
                "",
            category:
                foundProduct.category ||
                "",
            purchasePrice:
                foundProduct.purchasePrice ??
                "",
            sellingPrice:
                foundProduct.sellingPrice ??
                "",
            stock:
                foundProduct.stock ??
                0,
            minStock:
                foundProduct.minStock ??
                10,
            unit:
                foundProduct.unit ||
                "PCS",
            tax:
                foundProduct.tax ??
                0,
            description:
                foundProduct.description ||
                "",
            status:
                foundProduct.status ||
                "ACTIVE",
        });

        const storedCategories =
            getStorage(
                STORAGE_KEYS.CATEGORIES,
                null
            );

        if (
            Array.isArray(
                storedCategories
            ) &&
            storedCategories.length
        ) {
            const names =
                storedCategories
                    .map(
                        (category) =>
                            typeof category ===
                            "string"
                                ? category
                                : category.name
                    )
                    .filter(Boolean);

            if (names.length) {
                setCategories(
                    names
                );
            }
        }

        setLoading(false);
    };

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

    const validate = () => {
        const newErrors = {};

        if (!form.name?.trim()) {
            newErrors.name =
                "Product name is required.";
        }

        if (!form.sku?.trim()) {
            newErrors.sku =
                "SKU is required.";
        }

        if (!form.category) {
            newErrors.category =
                "Category is required.";
        }

        if (
            form.purchasePrice === "" ||
            Number(
                form.purchasePrice
            ) < 0
        ) {
            newErrors.purchasePrice =
                "Enter a valid purchase price.";
        }

        if (
            form.sellingPrice === "" ||
            Number(
                form.sellingPrice
            ) < 0
        ) {
            newErrors.sellingPrice =
                "Enter a valid selling price.";
        }

        if (
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

        if (
            form.stock === "" ||
            Number(form.stock) < 0
        ) {
            newErrors.stock =
                "Enter valid stock.";
        }

        if (
            form.minStock === "" ||
            Number(form.minStock) < 0
        ) {
            newErrors.minStock =
                "Enter valid minimum stock.";
        }

        return newErrors;
    };

    const handleUpdate = (
        event
    ) => {
        event.preventDefault();

        const validationErrors =
            validate();

        if (
            Object.keys(
                validationErrors
            ).length
        ) {
            setErrors(
                validationErrors
            );
            return;
        }

        setSaving(true);

        const products =
            getStorage(
                STORAGE_KEYS.PRODUCTS,
                []
            );

        const duplicateSKU =
            products.some(
                (item) =>
                    item.id !==
                        productId &&
                    item.sku
                        ?.toLowerCase() ===
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

        const updatedProducts =
            products.map(
                (item) =>
                    String(
                        item.id
                    ) ===
                    String(
                        productId
                    )
                        ? {
                              ...item,
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
                              stock: Number(
                                  form.stock
                              ),
                              minStock:
                                  Number(
                                      form.minStock
                                  ),
                              unit: form.unit,
                              tax: Number(
                                  form.tax ||
                                      0
                              ),
                              description:
                                  form.description?.trim() ||
                                  "",
                              status:
                                  form.status,
                              updatedAt:
                                  new Date().toISOString(),
                          }
                        : item
            );

        setStorage(
            STORAGE_KEYS.PRODUCTS,
            updatedProducts
        );

        const updatedProduct =
            updatedProducts.find(
                (item) =>
                    String(
                        item.id
                    ) ===
                    String(
                        productId
                    )
            );

        setProduct(
            updatedProduct
        );

        setSaving(false);

        router.push(
            `/user/products/${productId}`
        );

        router.refresh();
    };

    const handleDelete = () => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this product?"
            );

        if (!confirmed) {
            return;
        }

        const products =
            getStorage(
                STORAGE_KEYS.PRODUCTS,
                []
            );

        const updated =
            products.filter(
                (item) =>
                    String(
                        item.id
                    ) !==
                    String(
                        productId
                    )
            );

        setStorage(
            STORAGE_KEYS.PRODUCTS,
            updated
        );

        router.push(
            "/user/products"
        );
    };

    const formatCurrency = (
        amount
    ) => {
        return `₹${Number(
            amount || 0
        ).toLocaleString(
            "en-IN"
        )}`;
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <RefreshCw
                    size={28}
                    className="animate-spin text-slate-400"
                />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                    <Package
                        size={28}
                        className="text-slate-400"
                    />

                </div>

                <h2 className="mt-4 text-lg font-bold text-slate-800">
                    Product not found
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    This product may have
                    been deleted.
                </p>

                <Link
                    href="/user/products"
                    className="mt-5 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                >
                    <ArrowLeft
                        size={16}
                    />

                    Back to Products
                </Link>

            </div>
        );
    }

    if (isEditMode) {
        return (
            <div className="mx-auto max-w-4xl space-y-6">

                {/* HEADER */}

                <div className="flex items-center gap-4">

                    <Link
                        href={`/user/products/${productId}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    >
                        <ArrowLeft
                            size={18}
                        />
                    </Link>

                    <div>

                        <h1 className="text-2xl font-bold text-slate-900">
                            Edit Product
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Update product
                            information.
                        </p>

                    </div>

                </div>

                <form
                    onSubmit={
                        handleUpdate
                    }
                    className="space-y-6"
                >

                    {/* BASIC */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h2 className="text-base font-bold text-slate-900">
                            Basic Information
                        </h2>

                        <div className="mt-6 grid gap-5 md:grid-cols-2">

                            <FormInput
                                label="Product Name"
                                required
                                value={
                                    form.name
                                }
                                onChange={(
                                    value
                                ) =>
                                    handleChange(
                                        "name",
                                        value
                                    )
                                }
                                error={
                                    errors.name
                                }
                            />

                            <FormInput
                                label="SKU"
                                required
                                value={
                                    form.sku
                                }
                                onChange={(
                                    value
                                ) =>
                                    handleChange(
                                        "sku",
                                        value
                                    )
                                }
                                error={
                                    errors.sku
                                }
                            />

                            <FormSelect
                                label="Category"
                                required
                                value={
                                    form.category
                                }
                                onChange={(
                                    value
                                ) =>
                                    handleChange(
                                        "category",
                                        value
                                    )
                                }
                                options={
                                    categories
                                }
                                error={
                                    errors.category
                                }
                            />

                            <FormSelect
                                label="Unit"
                                value={
                                    form.unit
                                }
                                onChange={(
                                    value
                                ) =>
                                    handleChange(
                                        "unit",
                                        value
                                    )
                                }
                                options={[
                                    "PCS",
                                    "BOX",
                                    "KG",
                                    "GRAM",
                                    "LITRE",
                                    "METER",
                                    "PACK",
                                    "DOZEN",
                                ]}
                            />

                        </div>

                    </div>

                    {/* PRICING */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h2 className="text-base font-bold text-slate-900">
                            Pricing & Stock
                        </h2>

                        <div className="mt-6 grid gap-5 md:grid-cols-2">

                            <FormNumber
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
                                error={
                                    errors.purchasePrice
                                }
                            />

                            <FormNumber
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
                                error={
                                    errors.sellingPrice
                                }
                            />

                            <FormNumber
                                label="Stock"
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
                                error={
                                    errors.stock
                                }
                            />

                            <FormNumber
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
                                error={
                                    errors.minStock
                                }
                            />

                            <FormNumber
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
                            />

                            <FormSelect
                                label="Status"
                                value={
                                    form.status
                                }
                                onChange={(
                                    value
                                ) =>
                                    handleChange(
                                        "status",
                                        value
                                    )
                                }
                                options={[
                                    "ACTIVE",
                                    "INACTIVE",
                                ]}
                            />

                        </div>

                    </div>

                    {/* DESCRIPTION */}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h2 className="text-base font-bold text-slate-900">
                            Description
                        </h2>

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
                            className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                        />

                    </div>

                    {/* ACTION */}

                    <div className="flex justify-end gap-3">

                        <Link
                            href={`/user/products/${productId}`}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={
                                saving
                            }
                            className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                        >

                            {saving ? (
                                <RefreshCw
                                    size={
                                        17
                                    }
                                    className="animate-spin"
                                />
                            ) : (
                                <Save
                                    size={
                                        17
                                    }
                                />
                            )}

                            {saving
                                ? "Updating..."
                                : "Update Product"}

                        </button>

                    </div>

                </form>

            </div>
        );
    }

    const stock =
        Number(
            product.stock || 0
        );

    const minStock =
        Number(
            product.minStock || 0
        );

    const isLowStock =
        stock <= minStock;

    const profit =
        Number(
            product.sellingPrice ||
                0
        ) -
        Number(
            product.purchasePrice ||
                0
        );

    return (
        <div className="space-y-6">

            {/* HEADER */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div className="flex items-center gap-4">

                    <Link
                        href="/user/products"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    >
                        <ArrowLeft
                            size={18}
                        />
                    </Link>

                    <div>

                        <div className="flex items-center gap-2">

                            <Package
                                size={22}
                                className="text-slate-600"
                            />

                            <h1 className="text-2xl font-bold text-slate-900">
                                {
                                    product.name
                                }
                            </h1>

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            SKU:{" "}
                            {
                                product.sku
                            }
                        </p>

                    </div>

                </div>

                <div className="flex gap-2">

                    <Link
                        href={`/user/products/${productId}?edit=true`}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <Pencil
                            size={16}
                        />

                        Edit
                    </Link>

                    <button
                        type="button"
                        onClick={
                            handleDelete
                        }
                        className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        <Trash2
                            size={16}
                        />

                        Delete
                    </button>

                </div>

            </div>

            {/* STATUS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <div>

                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Product Status
                        </p>

                        <div className="mt-2 flex items-center gap-2">

                            {product.status ===
                            "ACTIVE" ? (
                                <CheckCircle2
                                    size={
                                        20
                                    }
                                    className="text-emerald-500"
                                />
                            ) : (
                                <XCircle
                                    size={
                                        20
                                    }
                                    className="text-red-500"
                                />
                            )}

                            <span
                                className={`text-sm font-bold ${
                                    product.status ===
                                    "ACTIVE"
                                        ? "text-emerald-600"
                                        : "text-red-600"
                                }`}
                            >
                                {
                                    product.status
                                }
                            </span>

                        </div>

                    </div>

                    <div className="rounded-xl bg-slate-50 px-4 py-3">

                        <p className="text-xs text-slate-400">
                            Category
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                            {
                                product.category ||
                                "Uncategorized"
                            }
                        </p>

                    </div>

                </div>

            </div>

            {/* PRODUCT STATS */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <InfoCard
                    label="Purchase Price"
                    value={formatCurrency(
                        product.purchasePrice
                    )}
                />

                <InfoCard
                    label="Selling Price"
                    value={formatCurrency(
                        product.sellingPrice
                    )}
                />

                <InfoCard
                    label="Current Stock"
                    value={`${stock} ${
                        product.unit ||
                        "PCS"
                    }`}
                    danger={
                        isLowStock
                    }
                />

                <InfoCard
                    label="Profit / Unit"
                    value={formatCurrency(
                        profit
                    )}
                />

            </div>

            {/* DETAILS */}

            <div className="grid gap-6 lg:grid-cols-2">

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <h2 className="text-base font-bold text-slate-900">
                        Product Details
                    </h2>

                    <div className="mt-6 space-y-4">

                        <DetailRow
                            label="Product Name"
                            value={
                                product.name
                            }
                        />

                        <DetailRow
                            label="SKU"
                            value={
                                product.sku
                            }
                        />

                        <DetailRow
                            label="Category"
                            value={
                                product.category ||
                                "—"
                            }
                        />

                        <DetailRow
                            label="Unit"
                            value={
                                product.unit ||
                                "PCS"
                            }
                        />

                        <DetailRow
                            label="Tax"
                            value={`${Number(
                                product.tax ||
                                    0
                            )}%`}
                        />

                        <DetailRow
                            label="Minimum Stock"
                            value={`${minStock} ${
                                product.unit ||
                                "PCS"
                            }`}
                        />

                        <DetailRow
                            label="Created At"
                            value={
                                product.createdAt
                                    ? new Date(
                                          product.createdAt
                                      ).toLocaleDateString(
                                          "en-IN"
                                      )
                                    : "—"
                            }
                        />

                    </div>

                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <h2 className="text-base font-bold text-slate-900">
                        Description
                    </h2>

                    <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-500">
                        {product.description ||
                            "No description available."}
                    </p>

                </div>

            </div>

            {/* STOCK ALERT */}

            {isLowStock && (
                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">

                    <div className="flex gap-3">

                        <Package
                            size={20}
                            className="mt-0.5 shrink-0 text-orange-600"
                        />

                        <div>

                            <h3 className="text-sm font-bold text-orange-800">
                                Low Stock Alert
                            </h3>

                            <p className="mt-1 text-sm text-orange-700">
                                Current stock is{" "}
                                <strong>
                                    {stock}
                                </strong>{" "}
                                and minimum
                                stock level is{" "}
                                <strong>
                                    {minStock}
                                </strong>
                                . Consider
                                restocking this
                                product.
                            </p>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

/* =========================================
   FORM INPUT
========================================= */

function FormInput({
    label,
    required,
    value,
    onChange,
    error,
}) {
    return (
        <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}{" "}
                {required && (
                    <span className="text-red-500">
                        *
                    </span>
                )}
            </label>

            <input
                type="text"
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                className={`h-11 w-full rounded-xl border bg-slate-50 px-4 text-sm outline-none focus:bg-white ${
                    error
                        ? "border-red-300"
                        : "border-slate-200"
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

/* =========================================
   FORM NUMBER
========================================= */

function FormNumber({
    label,
    required,
    value,
    onChange,
    error,
}) {
    return (
        <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}{" "}
                {required && (
                    <span className="text-red-500">
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
                className={`h-11 w-full rounded-xl border bg-slate-50 px-4 text-sm outline-none focus:bg-white ${
                    error
                        ? "border-red-300"
                        : "border-slate-200"
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

/* =========================================
   FORM SELECT
========================================= */

function FormSelect({
    label,
    required,
    value,
    onChange,
    options,
    error,
}) {
    return (
        <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}{" "}
                {required && (
                    <span className="text-red-500">
                        *
                    </span>
                )}
            </label>

            <select
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                className={`h-11 w-full rounded-xl border bg-slate-50 px-4 text-sm outline-none focus:bg-white ${
                    error
                        ? "border-red-300"
                        : "border-slate-200"
                }`}
            >

                {options.map(
                    (option) => (
                        <option
                            key={option}
                            value={option}
                        >
                            {option}
                        </option>
                    )
                )}

            </select>

            {error && (
                <p className="mt-1 text-xs text-red-500">
                    {error}
                </p>
            )}

        </div>
    );
}

/* =========================================
   INFO CARD
========================================= */

function InfoCard({
    label,
    value,
    danger = false,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-medium text-slate-400">
                {label}
            </p>

            <p
                className={`mt-2 text-xl font-bold ${
                    danger
                        ? "text-red-600"
                        : "text-slate-900"
                }`}
            >
                {value}
            </p>

        </div>
    );
}

/* =========================================
   DETAIL ROW
========================================= */

function DetailRow({
    label,
    value,
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">

            <span className="text-sm text-slate-400">
                {label}
            </span>

            <span className="text-right text-sm font-semibold text-slate-700">
                {value}
            </span>

        </div>
    );
}