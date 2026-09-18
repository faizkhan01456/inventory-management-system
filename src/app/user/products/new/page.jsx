"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    ArrowLeft,
    Package,
    Save,
    RefreshCw,
    ImagePlus,
    X,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

/* =========================================
   DEFAULT CATEGORIES
========================================= */

const defaultCategories = [
    "Electronics",
    "Accessories",
    "Grocery",
    "Clothing",
    "Furniture",
    "Stationery",
    "Beauty",
    "Sports",
    "Other",
];

/* =========================================
   PAGE
========================================= */

export default function NewProductPage() {
    const router = useRouter();

    const [categories, setCategories] = useState([]);

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
        image: "",
    });

    const [errors, setErrors] = useState({});

    const [saving, setSaving] = useState(false);

    /* =========================================
       LOAD CATEGORIES
    ========================================= */

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = () => {
        const storedCategories = getStorage(
            STORAGE_KEYS.CATEGORIES,
            []
        );

        let categoryNames = [];

        if (
            Array.isArray(storedCategories) &&
            storedCategories.length > 0
        ) {
            categoryNames = storedCategories
                .map((category) => {
                    /* STRING CATEGORY */

                    if (
                        typeof category ===
                        "string"
                    ) {
                        return category.trim();
                    }

                    /* OBJECT CATEGORY */

                    if (
                        typeof category ===
                            "object" &&
                        category !== null
                    ) {
                        return (
                            category.name ||
                            category.categoryName ||
                            category.title ||
                            ""
                        );
                    }

                    return "";
                })
                .filter(Boolean);
        }

        const uniqueCategories = [
            ...new Set([
                ...defaultCategories,
                ...categoryNames,
            ]),
        ];

        setCategories(uniqueCategories);
    };

    /* =========================================
       HANDLE INPUT
    ========================================= */

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));
    };

    /* =========================================
       IMAGE UPLOAD
    ========================================= */

    const handleImageChange = (
        event
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        /* ALLOWED FILE TYPES */

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (
            !allowedTypes.includes(
                file.type
            )
        ) {
            setErrors(
                (previous) => ({
                    ...previous,
                    image:
                        "Only JPG, PNG and WEBP images are allowed.",
                })
            );

            event.target.value = "";

            return;
        }

        /* MAX 2 MB */

        const maxSize =
            2 * 1024 * 1024;

        if (file.size > maxSize) {
            setErrors(
                (previous) => ({
                    ...previous,
                    image:
                        "Image size must be less than 2 MB.",
                })
            );

            event.target.value = "";

            return;
        }

        /* READ IMAGE */

        const reader =
            new FileReader();

        reader.onload = () => {
            setForm(
                (previous) => ({
                    ...previous,
                    image:
                        reader.result,
                })
            );

            setErrors(
                (previous) => ({
                    ...previous,
                    image: "",
                })
            );
        };

        reader.onerror = () => {
            setErrors(
                (previous) => ({
                    ...previous,
                    image:
                        "Unable to read image.",
                })
            );
        };

        reader.readAsDataURL(file);
    };

    /* =========================================
       REMOVE IMAGE
    ========================================= */

    const removeImage = () => {
        setForm(
            (previous) => ({
                ...previous,
                image: "",
            })
        );

        setErrors(
            (previous) => ({
                ...previous,
                image: "",
            })
        );
    };

    /* =========================================
       VALIDATION
    ========================================= */

    const validate = () => {
        const newErrors = {};

        /* PRODUCT NAME */

        if (!form.name.trim()) {
            newErrors.name =
                "Product name is required.";
        }

        /* SKU */

        if (!form.sku.trim()) {
            newErrors.sku =
                "SKU is required.";
        }

        /* CATEGORY */

        if (!form.category) {
            newErrors.category =
                "Category is required.";
        }

        /* PURCHASE PRICE */

        if (
            form.purchasePrice ===
                "" ||
            Number(
                form.purchasePrice
            ) < 0
        ) {
            newErrors.purchasePrice =
                "Valid purchase price is required.";
        }

        /* SELLING PRICE */

        if (
            form.sellingPrice ===
                "" ||
            Number(
                form.sellingPrice
            ) < 0
        ) {
            newErrors.sellingPrice =
                "Valid selling price is required.";
        }

        /* STOCK */

        if (
            form.stock === "" ||
            Number(form.stock) < 0
        ) {
            newErrors.stock =
                "Valid opening stock is required.";
        }

        /* MIN STOCK */

        if (
            form.minStock ===
                "" ||
            Number(
                form.minStock
            ) < 0
        ) {
            newErrors.minStock =
                "Valid minimum stock is required.";
        }

        /* TAX */

        if (
            Number(form.tax || 0) <
                0 ||
            Number(form.tax || 0) >
                100
        ) {
            newErrors.tax =
                "Tax must be between 0 and 100.";
        }

        setErrors(newErrors);

        return (
            Object.keys(
                newErrors
            ).length === 0
        );
    };

    /* =========================================
       SUBMIT
    ========================================= */

    const handleSubmit = (
        event
    ) => {
        event.preventDefault();

        const isValid =
            validate();

        if (!isValid) {
            return;
        }

        setSaving(true);

        try {
            const storedProducts =
                getStorage(
                    STORAGE_KEYS.PRODUCTS,
                    []
                );

            const existingProducts =
                Array.isArray(
                    storedProducts
                )
                    ? storedProducts
                    : [];

            /* CHECK DUPLICATE SKU */

            const duplicateSku =
                existingProducts.some(
                    (product) =>
                        product.sku
                            ?.toLowerCase()
                            .trim() ===
                        form.sku
                            .toLowerCase()
                            .trim()
                );

            if (duplicateSku) {
                setErrors({
                    sku:
                        "This SKU already exists.",
                });

                setSaving(false);

                return;
            }

            /* CREATE PRODUCT */

            const product = {
                id: `product_${Date.now()}`,

                name:
                    form.name.trim(),

                sku:
                    form.sku
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
                        form.minStock ||
                            0
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

                /* PRODUCT IMAGE */

                image:
                    form.image || "",

                createdAt:
                    new Date().toISOString(),
            };

            /* SAVE PRODUCT */

            const updatedProducts =
                [
                    ...existingProducts,
                    product,
                ];

            setStorage(
                STORAGE_KEYS.PRODUCTS,
                updatedProducts
            );

            /* REDIRECT */

            router.push(
                "/user/products"
            );
        } catch (error) {
            console.error(
                "Create product error:",
                error
            );

            alert(
                "Something went wrong while creating the product."
            );

            setSaving(false);
        }
    };

    /* =========================================
       LOADING
    ========================================= */

    if (
        categories.length === 0
    ) {
        return (
            <div className="space-y-6">

                <div className="flex items-center gap-3">

                    <Link
                        href="/user/products"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    >
                        <ArrowLeft
                            size={18}
                        />
                    </Link>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Add Product
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Create a new product and add it to your inventory.
                        </p>
                    </div>

                </div>

                {/* FORM WITHOUT WAITING FOR CATEGORY */}

                <ProductForm
                    form={form}
                    errors={errors}
                    saving={saving}
                    categories={
                        defaultCategories
                    }
                    handleChange={
                        handleChange
                    }
                    handleImageChange={
                        handleImageChange
                    }
                    removeImage={
                        removeImage
                    }
                    handleSubmit={
                        handleSubmit
                    }
                />

            </div>
        );
    }

    /* =========================================
       PAGE
    ========================================= */

    return (
        <div className="space-y-6">

            {/* =================================
                HEADER
            ================================= */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div className="flex items-center gap-3">

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
                                size={24}
                                className="text-slate-700"
                            />

                            <h1 className="text-2xl font-bold text-slate-900">
                                Add Product
                            </h1>

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Create a new product and add it to your inventory.
                        </p>

                    </div>

                </div>

            </div>

            {/* =================================
                FORM
            ================================= */}

            <ProductForm
                form={form}
                errors={errors}
                saving={saving}
                categories={
                    categories
                }
                handleChange={
                    handleChange
                }
                handleImageChange={
                    handleImageChange
                }
                removeImage={
                    removeImage
                }
                handleSubmit={
                    handleSubmit
                }
            />

        </div>
    );
}

/* =========================================
   PRODUCT FORM
========================================= */

function ProductForm({
    form,
    errors,
    saving,
    categories,
    handleChange,
    handleImageChange,
    removeImage,
    handleSubmit,
}) {
    return (
        <form
            onSubmit={
                handleSubmit
            }
            className="space-y-6"
        >

            {/* =================================
                BASIC INFORMATION
            ================================= */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-6">

                    <h2 className="text-base font-bold text-slate-900">
                        Basic Information
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Enter basic product information.
                    </p>

                </div>

                <div className="grid gap-5 md:grid-cols-2">

                    {/* PRODUCT NAME */}

                    <FormInput
                        label="Product Name"
                        name="name"
                        value={
                            form.name
                        }
                        onChange={
                            handleChange
                        }
                        placeholder="e.g. Wireless Keyboard"
                        required
                        error={
                            errors.name
                        }
                    />

                    {/* SKU */}

                    <FormInput
                        label="SKU"
                        name="sku"
                        value={
                            form.sku
                        }
                        onChange={
                            handleChange
                        }
                        placeholder="e.g. KB-WL-001"
                        required
                        error={
                            errors.sku
                        }
                    />

                    {/* CATEGORY */}

                    <FormSelect
                        label="Category"
                        name="category"
                        value={
                            form.category
                        }
                        onChange={
                            handleChange
                        }
                        required
                        error={
                            errors.category
                        }
                    >

                        <option value="">
                            Select Category
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

                    </FormSelect>

                    {/* UNIT */}

                    <FormSelect
                        label="Unit"
                        name="unit"
                        value={
                            form.unit
                        }
                        onChange={
                            handleChange
                        }
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

                        <option value="LTR">
                            LTR
                        </option>

                        <option value="MTR">
                            MTR
                        </option>

                    </FormSelect>

                </div>

            </div>

            {/* =================================
                PRODUCT IMAGE
            ================================= */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-6">

                    <h2 className="text-base font-bold text-slate-900">
                        Product Image
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Upload JPG, PNG or WEBP image. Maximum size 2 MB.
                    </p>

                </div>

                {form.image ? (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

                        {/* IMAGE PREVIEW */}

                        <div className="relative h-40 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                            <img
                                src={
                                    form.image
                                }
                                alt="Product preview"
                                className="h-full w-full object-cover"
                            />

                        </div>

                        {/* IMAGE ACTIONS */}

                        <div className="flex flex-wrap gap-2">

                            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">

                                <ImagePlus
                                    size={17}
                                />

                                Change Image

                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={
                                        handleImageChange
                                    }
                                    className="hidden"
                                />

                            </label>

                            <button
                                type="button"
                                onClick={
                                    removeImage
                                }
                                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
                            >

                                <X
                                    size={17}
                                />

                                Remove

                            </button>

                        </div>

                    </div>
                ) : (
                    <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 text-center transition hover:border-slate-300 hover:bg-white">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">

                            <ImagePlus
                                size={25}
                            />

                        </div>

                        <p className="mt-4 text-sm font-bold text-slate-700">
                            Click to upload product image
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            JPG, PNG or WEBP · Max 2 MB
                        </p>

                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={
                                handleImageChange
                            }
                            className="hidden"
                        />

                    </label>
                )}

                {errors.image && (
                    <p className="mt-3 text-sm font-medium text-red-600">
                        {
                            errors.image
                        }
                    </p>
                )}

            </div>

            {/* =================================
                PRICING & STOCK
            ================================= */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-6">

                    <h2 className="text-base font-bold text-slate-900">
                        Pricing & Stock
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Configure pricing and opening inventory.
                    </p>

                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                    {/* PURCHASE PRICE */}

                    <FormNumber
                        label="Purchase Price"
                        name="purchasePrice"
                        value={
                            form.purchasePrice
                        }
                        onChange={
                            handleChange
                        }
                        placeholder="0"
                        min="0"
                        error={
                            errors.purchasePrice
                        }
                    />

                    {/* SELLING PRICE */}

                    <FormNumber
                        label="Selling Price"
                        name="sellingPrice"
                        value={
                            form.sellingPrice
                        }
                        onChange={
                            handleChange
                        }
                        placeholder="0"
                        min="0"
                        error={
                            errors.sellingPrice
                        }
                    />

                    {/* OPENING STOCK */}

                    <FormNumber
                        label="Opening Stock"
                        name="stock"
                        value={
                            form.stock
                        }
                        onChange={
                            handleChange
                        }
                        placeholder="0"
                        min="0"
                        error={
                            errors.stock
                        }
                    />

                    {/* MINIMUM STOCK */}

                    <FormNumber
                        label="Minimum Stock"
                        name="minStock"
                        value={
                            form.minStock
                        }
                        onChange={
                            handleChange
                        }
                        placeholder="10"
                        min="0"
                        error={
                            errors.minStock
                        }
                    />

                    {/* TAX */}

                    <FormNumber
                        label="Tax (%)"
                        name="tax"
                        value={
                            form.tax
                        }
                        onChange={
                            handleChange
                        }
                        placeholder="18"
                        min="0"
                        max="100"
                        error={
                            errors.tax
                        }
                    />

                    {/* STATUS */}

                    <FormSelect
                        label="Status"
                        name="status"
                        value={
                            form.status
                        }
                        onChange={
                            handleChange
                        }
                    >

                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="INACTIVE">
                            Inactive
                        </option>

                    </FormSelect>

                </div>

            </div>

            {/* =================================
                DESCRIPTION
            ================================= */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-6">

                    <h2 className="text-base font-bold text-slate-900">
                        Description
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Add additional information about the product.
                    </p>

                </div>

                <textarea
                    name="description"
                    value={
                        form.description
                    }
                    onChange={
                        handleChange
                    }
                    rows={5}
                    placeholder="Write product description..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                />

            </div>

            {/* =================================
                ACTIONS
            ================================= */}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <Link
                    href="/user/products"
                    className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    Cancel
                </Link>

                <button
                    type="submit"
                    disabled={
                        saving
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >

                    {saving ? (
                        <>
                            <RefreshCw
                                size={17}
                                className="animate-spin"
                            />

                            Saving...
                        </>
                    ) : (
                        <>
                            <Save
                                size={17}
                            />

                            Save Product
                        </>
                    )}

                </button>

            </div>

        </form>
    );
}

/* =========================================
   FORM INPUT
========================================= */

function FormInput({
    label,
    name,
    value,
    onChange,
    placeholder,
    required = false,
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
                type="text"
                name={name}
                value={
                    value
                }
                onChange={
                    onChange
                }
                placeholder={
                    placeholder
                }
                className={`h-11 w-full rounded-xl border ${
                    error
                        ? "border-red-300"
                        : "border-slate-200"
                } bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white`}
            />

            {error && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                    {
                        error
                    }
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
    name,
    value,
    onChange,
    placeholder,
    min,
    max,
    error,
}) {
    return (
        <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </label>

            <input
                type="number"
                name={name}
                value={
                    value
                }
                onChange={
                    onChange
                }
                placeholder={
                    placeholder
                }
                min={min}
                max={max}
                className={`h-11 w-full rounded-xl border ${
                    error
                        ? "border-red-300"
                        : "border-slate-200"
                } bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white`}
            />

            {error && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                    {
                        error
                    }
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
    name,
    value,
    onChange,
    children,
    required = false,
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

            <select
                name={name}
                value={
                    value
                }
                onChange={
                    onChange
                }
                className={`h-11 w-full rounded-xl border ${
                    error
                        ? "border-red-300"
                        : "border-slate-200"
                } bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white`}
            >
                {
                    children
                }
            </select>

            {error && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                    {
                        error
                    }
                </p>
            )}

        </div>
    );
}