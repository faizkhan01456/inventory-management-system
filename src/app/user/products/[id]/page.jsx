"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    useParams,
    useRouter,
    useSearchParams,
} from "next/navigation";

import {
    ArrowLeft,
    Package,
    Pencil,
    Trash2,
    Save,
    RefreshCw,
    CheckCircle2,
    XCircle,
    ImagePlus,
    X,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

const defaultCategories = [
    "Electronics",
    "Accessories",
    "Grocery",
    "Clothing",
    "Furniture",
    "Other",
];

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const productId = params?.id;
    const isEditMode = searchParams.get("edit") === "true";

    const [product, setProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: "",
        sku: "",
        category: "",
        purchasePrice: "",
        sellingPrice: "",
        stock: "",
        minStock: "",
        unit: "PCS",
        tax: "18",
        description: "",
        status: "ACTIVE",
        image: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadProduct();
        loadCategories();
    }, [productId]);

    const loadProduct = () => {
        setLoading(true);

        const products = getStorage(
            STORAGE_KEYS.PRODUCTS,
            []
        );

        const foundProduct = Array.isArray(products)
            ? products.find(
                  (item) =>
                      String(item.id) ===
                      String(productId)
              )
            : null;

        if (foundProduct) {
            setProduct(foundProduct);

            setForm({
                name: foundProduct.name || "",
                sku: foundProduct.sku || "",
                category: foundProduct.category || "",
                purchasePrice:
                    foundProduct.purchasePrice ?? "",
                sellingPrice:
                    foundProduct.sellingPrice ?? "",
                stock: foundProduct.stock ?? "",
                minStock: foundProduct.minStock ?? "",
                unit: foundProduct.unit || "PCS",
                tax: foundProduct.tax ?? "18",
                description:
                    foundProduct.description || "",
                status:
                    foundProduct.status || "ACTIVE",
                image: foundProduct.image || "",
            });
        }

        setLoading(false);
    };

    const loadCategories = () => {
        const storedCategories = getStorage(
            STORAGE_KEYS.CATEGORIES,
            []
        );

        if (Array.isArray(storedCategories)) {
            const names = storedCategories
                .map((item) =>
                    typeof item === "string"
                        ? item
                        : item.name
                )
                .filter(Boolean);

            setCategories([
                ...new Set([
                    ...defaultCategories,
                    ...names,
                ]),
            ]);
        } else {
            setCategories(defaultCategories);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setErrors((prev) => ({
                ...prev,
                image:
                    "Only JPG, PNG and WEBP images are allowed.",
            }));

            event.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setErrors((prev) => ({
                ...prev,
                image:
                    "Image size must be less than 2 MB.",
            }));

            event.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setForm((prev) => ({
                ...prev,
                image: reader.result,
            }));

            setErrors((prev) => ({
                ...prev,
                image: "",
            }));
        };

        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setForm((prev) => ({
            ...prev,
            image: "",
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name =
                "Product name is required.";
        }

        if (!form.sku.trim()) {
            newErrors.sku = "SKU is required.";
        }

        if (!form.category) {
            newErrors.category =
                "Category is required.";
        }

        if (
            form.purchasePrice === "" ||
            Number(form.purchasePrice) < 0
        ) {
            newErrors.purchasePrice =
                "Valid purchase price is required.";
        }

        if (
            form.sellingPrice === "" ||
            Number(form.sellingPrice) < 0
        ) {
            newErrors.sellingPrice =
                "Valid selling price is required.";
        }

        if (
            form.stock === "" ||
            Number(form.stock) < 0
        ) {
            newErrors.stock =
                "Valid stock is required.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleUpdate = (event) => {
        event.preventDefault();

        if (!validate()) return;

        setSaving(true);

        try {
            const products = getStorage(
                STORAGE_KEYS.PRODUCTS,
                []
            );

            const existingProducts =
                Array.isArray(products)
                    ? products
                    : [];

            const duplicateSku =
                existingProducts.some(
                    (item) =>
                        String(item.id) !==
                            String(productId) &&
                        item.sku?.toLowerCase() ===
                            form.sku
                                .trim()
                                .toLowerCase()
                );

            if (duplicateSku) {
                setErrors({
                    sku: "This SKU already exists.",
                });

                setSaving(false);
                return;
            }

            const updatedProducts =
                existingProducts.map((item) => {
                    if (
                        String(item.id) !==
                        String(productId)
                    ) {
                        return item;
                    }

                    return {
                        ...item,
                        name: form.name.trim(),
                        sku: form.sku
                            .trim()
                            .toUpperCase(),
                        category: form.category,
                        purchasePrice: Number(
                            form.purchasePrice
                        ),
                        sellingPrice: Number(
                            form.sellingPrice
                        ),
                        stock: Number(form.stock),
                        minStock: Number(
                            form.minStock || 0
                        ),
                        unit: form.unit,
                        tax: Number(form.tax || 0),
                        description:
                            form.description.trim(),
                        status: form.status,

                        // UPDATED IMAGE
                        image: form.image || "",
                    };
                });

            setStorage(
                STORAGE_KEYS.PRODUCTS,
                updatedProducts
            );

            const updatedProduct =
                updatedProducts.find(
                    (item) =>
                        String(item.id) ===
                        String(productId)
                );

            setProduct(updatedProduct);

            router.push(
                `/user/products/${productId}`
            );
        } catch (error) {
            console.error(
                "Update product error:",
                error
            );

            alert(
                "Something went wrong while updating product."
            );

            setSaving(false);
        }
    };

    const handleDelete = () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) return;

        const products = getStorage(
            STORAGE_KEYS.PRODUCTS,
            []
        );

        const updatedProducts =
            Array.isArray(products)
                ? products.filter(
                      (item) =>
                          String(item.id) !==
                          String(productId)
                  )
                : [];

        setStorage(
            STORAGE_KEYS.PRODUCTS,
            updatedProducts
        );

        router.push("/user/products");
    };

    const handleToggleStatus = () => {
        if (!product) return;

        const products = getStorage(
            STORAGE_KEYS.PRODUCTS,
            []
        );

        const updatedProducts =
            products.map((item) =>
                String(item.id) ===
                String(productId)
                    ? {
                          ...item,
                          status:
                              item.status ===
                              "ACTIVE"
                                  ? "INACTIVE"
                                  : "ACTIVE",
                      }
                    : item
            );

        setStorage(
            STORAGE_KEYS.PRODUCTS,
            updatedProducts
        );

        loadProduct();
    };

    const formatCurrency = (amount) => {
        return `₹${Number(
            amount || 0
        ).toLocaleString("en-IN")}`;
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <RefreshCw
                        size={28}
                        className="mx-auto animate-spin text-slate-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading product...
                    </p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                        <Package
                            size={28}
                            className="text-slate-400"
                        />
                    </div>

                    <h2 className="mt-4 text-lg font-bold text-slate-900">
                        Product not found
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        This product may have been deleted.
                    </p>

                    <Link
                        href="/user/products"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                    >
                        <ArrowLeft size={16} />
                        Back to Products
                    </Link>

                </div>
            </div>
        );
    }

    if (isEditMode) {
        return (
            <div className="space-y-6">

                <div className="flex items-center gap-3">

                    <Link
                        href={`/user/products/${productId}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    >
                        <ArrowLeft size={18} />
                    </Link>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Edit Product
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Update product information.
                        </p>
                    </div>

                </div>

                <form
                    onSubmit={handleUpdate}
                    className="space-y-6"
                >

                    {/* BASIC */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="mb-6">
                            <h2 className="text-base font-bold text-slate-900">
                                Basic Information
                            </h2>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">

                            <FormInput
                                label="Product Name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                error={errors.name}
                            />

                            <FormInput
                                label="SKU"
                                name="sku"
                                value={form.sku}
                                onChange={handleChange}
                                required
                                error={errors.sku}
                            />

                            <FormSelect
                                label="Category"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                required
                                error={errors.category}
                            >
                                <option value="">
                                    Select Category
                                </option>

                                {categories.map(
                                    (category) => (
                                        <option
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </option>
                                    )
                                )}
                            </FormSelect>

                            <FormSelect
                                label="Unit"
                                name="unit"
                                value={form.unit}
                                onChange={handleChange}
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

                    {/* IMAGE */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="mb-6">
                            <h2 className="text-base font-bold text-slate-900">
                                Product Image
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Change or remove the product image.
                            </p>
                        </div>

                        {form.image ? (
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

                                <div className="h-40 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                                    <img
                                        src={form.image}
                                        alt={form.name}
                                        className="h-full w-full object-cover"
                                    />

                                </div>

                                <div className="flex flex-wrap gap-2">

                                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">

                                        <ImagePlus size={17} />

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
                                        onClick={removeImage}
                                        className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
                                    >
                                        <X size={17} />
                                        Remove
                                    </button>

                                </div>

                            </div>
                        ) : (
                            <label className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 text-center hover:border-slate-300 hover:bg-white">

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                                    <ImagePlus size={25} />
                                </div>

                                <p className="mt-4 text-sm font-bold text-slate-700">
                                    Upload Product Image
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
                                {errors.image}
                            </p>
                        )}

                    </div>

                    {/* PRICING */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="mb-6">
                            <h2 className="text-base font-bold text-slate-900">
                                Pricing & Stock
                            </h2>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                            <FormNumber
                                label="Purchase Price"
                                name="purchasePrice"
                                value={
                                    form.purchasePrice
                                }
                                onChange={handleChange}
                                min="0"
                                error={
                                    errors.purchasePrice
                                }
                            />

                            <FormNumber
                                label="Selling Price"
                                name="sellingPrice"
                                value={
                                    form.sellingPrice
                                }
                                onChange={handleChange}
                                min="0"
                                error={
                                    errors.sellingPrice
                                }
                            />

                            <FormNumber
                                label="Stock"
                                name="stock"
                                value={form.stock}
                                onChange={handleChange}
                                min="0"
                                error={errors.stock}
                            />

                            <FormNumber
                                label="Minimum Stock"
                                name="minStock"
                                value={form.minStock}
                                onChange={handleChange}
                                min="0"
                            />

                            <FormNumber
                                label="Tax (%)"
                                name="tax"
                                value={form.tax}
                                onChange={handleChange}
                                min="0"
                                max="100"
                            />

                            <FormSelect
                                label="Status"
                                name="status"
                                value={form.status}
                                onChange={handleChange}
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

                    {/* DESCRIPTION */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h2 className="mb-5 text-base font-bold text-slate-900">
                            Description
                        </h2>

                        <textarea
                            name="description"
                            value={
                                form.description
                            }
                            onChange={handleChange}
                            rows={5}
                            placeholder="Write product description..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                        />

                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                        <Link
                            href={`/user/products/${productId}`}
                            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                            {saving ? (
                                <>
                                    <RefreshCw
                                        size={17}
                                        className="animate-spin"
                                    />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save size={17} />
                                    Update Product
                                </>
                            )}
                        </button>

                    </div>

                </form>
            </div>
        );
    }

    const stock = Number(product.stock || 0);
    const minStock = Number(
        product.minStock || 0
    );

    const isLowStock =
        product.status === "ACTIVE" &&
        stock <= minStock;

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div className="flex items-center gap-3">

                    <Link
                        href="/user/products"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    >
                        <ArrowLeft size={18} />
                    </Link>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Product Details
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            View product information.
                        </p>
                    </div>

                </div>

                <div className="flex gap-2">

                    <Link
                        href={`/user/products/${productId}?edit=true`}
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        <Pencil size={17} />
                        Edit Product
                    </Link>

                    <button
                        type="button"
                        onClick={handleDelete}
                        className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
                    >
                        <Trash2 size={17} />
                    </button>

                </div>

            </div>

            {/* IMAGE + PRODUCT HEADER */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-6 lg:flex-row">

                    <div className="flex h-64 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 lg:w-64">

                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <Package
                                size={70}
                                className="text-slate-300"
                            />
                        )}

                    </div>

                    <div className="flex-1">

                        <div className="flex flex-wrap items-start justify-between gap-4">

                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {product.name}
                                </h2>

                                <p className="mt-2 text-sm text-slate-500">
                                    SKU: {product.sku}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleToggleStatus}
                                className={`rounded-full px-4 py-2 text-xs font-bold ${
                                    product.status ===
                                    "ACTIVE"
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-red-50 text-red-600"
                                }`}
                            >
                                {product.status}
                            </button>

                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

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
                                warning={
                                    isLowStock
                                }
                            />

                            <InfoCard
                                label="Minimum Stock"
                                value={`${minStock} ${
                                    product.unit ||
                                    "PCS"
                                }`}
                            />

                        </div>

                    </div>

                </div>

            </div>

            {/* PRODUCT DETAILS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h2 className="mb-6 text-base font-bold text-slate-900">
                    Product Details
                </h2>

                <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">

                    <DetailRow
                        label="Product Name"
                        value={product.name}
                    />

                    <DetailRow
                        label="SKU"
                        value={product.sku}
                    />

                    <DetailRow
                        label="Category"
                        value={
                            product.category ||
                            "Uncategorized"
                        }
                    />

                    <DetailRow
                        label="Unit"
                        value={
                            product.unit || "PCS"
                        }
                    />

                    <DetailRow
                        label="Purchase Price"
                        value={formatCurrency(
                            product.purchasePrice
                        )}
                    />

                    <DetailRow
                        label="Selling Price"
                        value={formatCurrency(
                            product.sellingPrice
                        )}
                    />

                    <DetailRow
                        label="Tax"
                        value={`${Number(
                            product.tax || 0
                        )}%`}
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
                                : "-"
                        }
                    />

                </div>

            </div>

            {/* DESCRIPTION */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h2 className="mb-4 text-base font-bold text-slate-900">
                    Description
                </h2>

                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    {product.description ||
                        "No description available."}
                </p>

            </div>

        </div>
    );
}

function InfoCard({
    label,
    value,
    warning = false,
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

            <p className="text-xs font-medium text-slate-400">
                {label}
            </p>

            <p
                className={`mt-2 text-lg font-bold ${
                    warning
                        ? "text-red-600"
                        : "text-slate-900"
                }`}
            >
                {value}
            </p>

        </div>
    );
}

function DetailRow({
    label,
    value,
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">

            <span className="text-sm text-slate-400">
                {label}
            </span>

            <span className="text-right text-sm font-semibold text-slate-800">
                {value}
            </span>

        </div>
    );
}

function FormInput({
    label,
    name,
    value,
    onChange,
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
                value={value}
                onChange={onChange}
                className={`h-11 w-full rounded-xl border ${
                    error
                        ? "border-red-300"
                        : "border-slate-200"
                } bg-slate-50 px-4 text-sm outline-none focus:border-slate-400 focus:bg-white`}
            />

            {error && (
                <p className="mt-1.5 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

function FormNumber({
    label,
    name,
    value,
    onChange,
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
                value={value}
                onChange={onChange}
                min={min}
                max={max}
                className={`h-11 w-full rounded-xl border ${
                    error
                        ? "border-red-300"
                        : "border-slate-200"
                } bg-slate-50 px-4 text-sm outline-none focus:border-slate-400 focus:bg-white`}
            />

            {error && (
                <p className="mt-1.5 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

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
                value={value}
                onChange={onChange}
                className={`h-11 w-full rounded-xl border ${
                    error
                        ? "border-red-300"
                        : "border-slate-200"
                } bg-slate-50 px-4 text-sm outline-none focus:border-slate-400 focus:bg-white`}
            >
                {children}
            </select>

            {error && (
                <p className="mt-1.5 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}