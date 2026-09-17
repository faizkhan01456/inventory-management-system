"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
    Tags,
    Plus,
    Search,
    Pencil,
    Trash2,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Package,
    X,
    Save,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

const defaultCategories = [
    {
        id: "category_001",
        name: "Electronics",
        description:
            "Electronic products and devices",
        status: "ACTIVE",
        createdAt: "2026-09-01",
    },
    {
        id: "category_002",
        name: "Accessories",
        description:
            "Computer and mobile accessories",
        status: "ACTIVE",
        createdAt: "2026-09-01",
    },
    {
        id: "category_003",
        name: "Clothing",
        description:
            "Clothing and fashion products",
        status: "ACTIVE",
        createdAt: "2026-09-02",
    },
    {
        id: "category_004",
        name: "Grocery",
        description:
            "Grocery and daily-use products",
        status: "ACTIVE",
        createdAt: "2026-09-02",
    },
];

export default function CategoriesPage() {
    const [categories, setCategories] =
        useState([]);

    const [products, setProducts] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [showModal, setShowModal] =
        useState(false);

    const [editingCategory, setEditingCategory] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [form, setForm] = useState({
        name: "",
        description: "",
        status: "ACTIVE",
    });

    const [errors, setErrors] =
        useState({});

    /*
     * =========================================
     * LOAD DATA
     * =========================================
     */

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);

        const storedCategories =
            getStorage(
                STORAGE_KEYS.CATEGORIES,
                null
            );

        const storedProducts =
            getStorage(
                STORAGE_KEYS.PRODUCTS,
                []
            );

        let categoryData;

        if (
            Array.isArray(
                storedCategories
            )
        ) {
            categoryData =
                storedCategories;
        } else {
            categoryData =
                defaultCategories;

            setStorage(
                STORAGE_KEYS.CATEGORIES,
                categoryData
            );
        }

        setCategories(
            categoryData
        );

        setProducts(
            Array.isArray(
                storedProducts
            )
                ? storedProducts
                : []
        );

        setLoading(false);
    };

    /*
     * =========================================
     * SAVE CATEGORIES
     * =========================================
     */

    const saveCategories = (
        data
    ) => {
        setCategories(data);

        setStorage(
            STORAGE_KEYS.CATEGORIES,
            data
        );
    };

    /*
     * =========================================
     * OPEN ADD MODAL
     * =========================================
     */

    const openAddModal = () => {
        setEditingCategory(null);

        setForm({
            name: "",
            description: "",
            status: "ACTIVE",
        });

        setErrors({});

        setShowModal(true);
    };

    /*
     * =========================================
     * OPEN EDIT MODAL
     * =========================================
     */

    const openEditModal = (
        category
    ) => {
        setEditingCategory(
            category
        );

        setForm({
            name:
                category.name ||
                "",
            description:
                category.description ||
                "",
            status:
                category.status ||
                "ACTIVE",
        });

        setErrors({});

        setShowModal(true);
    };

    /*
     * =========================================
     * CLOSE MODAL
     * =========================================
     */

    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);

        setEditingCategory(null);

        setErrors({});
    };

    /*
     * =========================================
     * HANDLE FORM CHANGE
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
     * VALIDATION
     * =========================================
     */

    const validate = () => {
        const newErrors = {};

        const name =
            form.name.trim();

        if (!name) {
            newErrors.name =
                "Category name is required.";
        }

        const duplicate =
            categories.some(
                (category) => {
                    const sameName =
                        String(
                            category.name ||
                                ""
                        )
                            .trim()
                            .toLowerCase() ===
                        name.toLowerCase();

                    const isSameCategory =
                        editingCategory &&
                        String(
                            category.id
                        ) ===
                            String(
                                editingCategory.id
                            );

                    return (
                        sameName &&
                        !isSameCategory
                    );
                }
            );

        if (duplicate) {
            newErrors.name =
                "This category already exists.";
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

        const categoryName =
            form.name.trim();

        if (editingCategory) {
            /*
             * UPDATE
             */

            const updated =
                categories.map(
                    (category) =>
                        String(
                            category.id
                        ) ===
                        String(
                            editingCategory.id
                        )
                            ? {
                                  ...category,
                                  name: categoryName,
                                  description:
                                      form.description.trim(),
                                  status:
                                      form.status,
                                  updatedAt:
                                      new Date().toISOString(),
                              }
                            : category
                );

            saveCategories(
                updated
            );
        } else {
            /*
             * CREATE
             */

            const newCategory = {
                id: `category_${Date.now()}`,
                name: categoryName,
                description:
                    form.description.trim(),
                status:
                    form.status,
                createdAt:
                    new Date().toISOString(),
            };

            saveCategories([
                ...categories,
                newCategory,
            ]);
        }

        setTimeout(() => {
            setSaving(false);
            setShowModal(false);
            setEditingCategory(null);
        }, 300);
    };

    /*
     * =========================================
     * DELETE
     * =========================================
     */

    const handleDelete = (
        category
    ) => {
        const productCount =
            products.filter(
                (product) =>
                    String(
                        product.category ||
                            ""
                    ).toLowerCase() ===
                    String(
                        category.name ||
                            ""
                    ).toLowerCase()
            ).length;

        if (productCount > 0) {
            window.alert(
                `Cannot delete "${category.name}" because ${productCount} product(s) are using this category.`
            );

            return;
        }

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${category.name}"?`
            );

        if (!confirmed) {
            return;
        }

        const updated =
            categories.filter(
                (item) =>
                    String(
                        item.id
                    ) !==
                    String(
                        category.id
                    )
            );

        saveCategories(
            updated
        );
    };

    /*
     * =========================================
     * TOGGLE STATUS
     * =========================================
     */

    const handleToggleStatus = (
        category
    ) => {
        const updated =
            categories.map(
                (item) =>
                    String(
                        item.id
                    ) ===
                    String(
                        category.id
                    )
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

        saveCategories(
            updated
        );
    };

    /*
     * =========================================
     * PRODUCT COUNT
     * =========================================
     */

    const getProductCount = (
        categoryName
    ) => {
        return products.filter(
            (product) =>
                String(
                    product.category ||
                        ""
                ).toLowerCase() ===
                String(
                    categoryName ||
                        ""
                ).toLowerCase()
        ).length;
    };

    /*
     * =========================================
     * FILTER
     * =========================================
     */

    const filteredCategories =
        useMemo(() => {
            return categories.filter(
                (category) => {
                    const searchText =
                        search
                            .trim()
                            .toLowerCase();

                    const matchesSearch =
                        !searchText ||
                        String(
                            category.name ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                searchText
                            ) ||
                        String(
                            category.description ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                searchText
                            );

                    const matchesStatus =
                        statusFilter ===
                            "ALL" ||
                        category.status ===
                            statusFilter;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );
        }, [
            categories,
            search,
            statusFilter,
        ]);

    /*
     * =========================================
     * STATS
     * =========================================
     */

    const totalCategories =
        categories.length;

    const activeCategories =
        categories.filter(
            (category) =>
                category.status ===
                "ACTIVE"
        ).length;

    const inactiveCategories =
        categories.filter(
            (category) =>
                category.status !==
                "ACTIVE"
        ).length;

    const categoriesWithProducts =
        categories.filter(
            (category) =>
                getProductCount(
                    category.name
                ) > 0
        ).length;

    /*
     * =========================================
     * LOADING
     * =========================================
     */

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">

                <div className="text-center">

                    <RefreshCw
                        size={28}
                        className="mx-auto animate-spin text-slate-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading categories...
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* =================================
                HEADER
            ================================== */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>

                    <div className="flex items-center gap-2">

                        <Tags
                            size={24}
                            className="text-slate-700"
                        />

                        <h1 className="text-2xl font-bold text-slate-900">
                            Categories
                        </h1>

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Organize your products
                        into categories.
                    </p>

                </div>

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={
                            loadData
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
                            openAddModal
                        }
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    >

                        <Plus
                            size={17}
                        />

                        Add Category

                    </button>

                </div>

            </div>

            {/* =================================
                STATS
            ================================== */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                    title="Total Categories"
                    value={
                        totalCategories
                    }
                    icon={Tags}
                />

                <StatCard
                    title="Active Categories"
                    value={
                        activeCategories
                    }
                    icon={
                        CheckCircle2
                    }
                    type="success"
                />

                <StatCard
                    title="Inactive Categories"
                    value={
                        inactiveCategories
                    }
                    icon={XCircle}
                    type="danger"
                />

                <StatCard
                    title="Categories In Use"
                    value={
                        categoriesWithProducts
                    }
                    icon={Package}
                    type="info"
                />

            </div>

            {/* =================================
                FILTERS
            ================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="flex flex-col gap-3 md:flex-row">

                    <div className="relative flex-1">

                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(
                                event
                            ) =>
                                setSearch(
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder="Search categories..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                        />

                    </div>

                    <select
                        value={
                            statusFilter
                        }
                        onChange={(
                            event
                        ) =>
                            setStatusFilter(
                                event
                                    .target
                                    .value
                            )
                        }
                        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                    >

                        <option value="ALL">
                            All Status
                        </option>

                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="INACTIVE">
                            Inactive
                        </option>

                    </select>

                </div>

            </div>

            {/* =================================
                CATEGORY TABLE
            ================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                    <h2 className="text-base font-bold text-slate-900">
                        Category List
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Showing{" "}
                        {
                            filteredCategories.length
                        }{" "}
                        of{" "}
                        {
                            categories.length
                        }{" "}
                        categories
                    </p>

                </div>

                {filteredCategories.length ===
                0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                            <Tags
                                size={28}
                                className="text-slate-400"
                            />

                        </div>

                        <h3 className="mt-4 text-base font-bold text-slate-800">
                            No categories found
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                            Try changing your
                            search or add a
                            new category.
                        </p>

                        <button
                            type="button"
                            onClick={
                                openAddModal
                            }
                            className="mt-5 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                        >

                            <Plus
                                size={16}
                            />

                            Add Category

                        </button>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[900px]">

                            <thead>

                                <tr className="border-b border-slate-200 bg-slate-50">

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        CATEGORY
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        DESCRIPTION
                                    </th>

                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500">
                                        PRODUCTS
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        STATUS
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        CREATED
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        ACTIONS
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredCategories.map(
                                    (
                                        category
                                    ) => {
                                        const productCount =
                                            getProductCount(
                                                category.name
                                            );

                                        return (
                                            <tr
                                                key={
                                                    category.id
                                                }
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                            >

                                                {/* CATEGORY */}

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">

                                                            <Tags
                                                                size={
                                                                    18
                                                                }
                                                                className="text-slate-600"
                                                            />

                                                        </div>

                                                        <div>

                                                            <p className="text-sm font-bold text-slate-900">
                                                                {
                                                                    category.name
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* DESCRIPTION */}

                                                <td className="px-6 py-5">

                                                    <p className="max-w-[300px] truncate text-sm text-slate-500">
                                                        {
                                                            category.description ||
                                                            "No description"
                                                        }
                                                    </p>

                                                </td>

                                                {/* PRODUCTS */}

                                                <td className="px-6 py-5 text-center">

                                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">

                                                        <Package
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        {
                                                            productCount
                                                        }

                                                    </span>

                                                </td>

                                                {/* STATUS */}

                                                <td className="px-6 py-5">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                category
                                                            )
                                                        }
                                                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                                                            category.status ===
                                                            "ACTIVE"
                                                                ? "bg-emerald-50 text-emerald-600"
                                                                : "bg-red-50 text-red-600"
                                                        }`}
                                                    >

                                                        {
                                                            category.status
                                                        }

                                                    </button>

                                                </td>

                                                {/* CREATED */}

                                                <td className="px-6 py-5">

                                                    <span className="text-sm text-slate-500">

                                                        {category.createdAt
                                                            ? new Date(
                                                                  category.createdAt
                                                              ).toLocaleDateString(
                                                                  "en-IN",
                                                                  {
                                                                      day: "2-digit",
                                                                      month: "short",
                                                                      year: "numeric",
                                                                  }
                                                              )
                                                            : "—"}

                                                    </span>

                                                </td>

                                                {/* ACTIONS */}

                                                <td className="px-6 py-5">

                                                    <div className="flex justify-end gap-1">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    category
                                                                )
                                                            }
                                                            title="Edit"
                                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                                        >

                                                            <Pencil
                                                                size={
                                                                    17
                                                                }
                                                            />

                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    category
                                                                )
                                                            }
                                                            title="Delete"
                                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                                        >

                                                            <Trash2
                                                                size={
                                                                    17
                                                                }
                                                            />

                                                        </button>

                                                    </div>

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

            {/* =================================
                ADD / EDIT MODAL
            ================================== */}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

                    <div
                        className="absolute inset-0"
                        onClick={
                            closeModal
                        }
                    />

                    <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* MODAL HEADER */}

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                            <div>

                                <div className="flex items-center gap-2">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">

                                        <Tags
                                            size={
                                                18
                                            }
                                            className="text-slate-600"
                                        />

                                    </div>

                                    <h2 className="text-lg font-bold text-slate-900">
                                        {editingCategory
                                            ? "Edit Category"
                                            : "Add Category"}
                                    </h2>

                                </div>

                                <p className="mt-1 text-xs text-slate-400">
                                    {editingCategory
                                        ? "Update category information."
                                        : "Create a new product category."}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeModal
                                }
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >

                                <X
                                    size={19}
                                />

                            </button>

                        </div>

                        {/* MODAL FORM */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="space-y-5 p-6">

                                {/* NAME */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">

                                        Category Name

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
                                        placeholder="e.g. Electronics"
                                        autoFocus
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

                                {/* DESCRIPTION */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Description
                                    </label>

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
                                        rows={4}
                                        placeholder="Enter category description..."
                                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                                    />

                                </div>

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

                            {/* MODAL FOOTER */}

                            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        saving
                                    }
                                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {saving ? (
                                        <RefreshCw
                                            size={
                                                16
                                            }
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Save
                                            size={
                                                16
                                            }
                                        />
                                    )}

                                    {saving
                                        ? "Saving..."
                                        : editingCategory
                                          ? "Update Category"
                                          : "Save Category"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

/* =========================================
   STAT CARD
========================================= */

function StatCard({
    title,
    value,
    icon: Icon,
    type = "default",
}) {
    const styles = {
        default:
            "bg-slate-100 text-slate-600",

        success:
            "bg-emerald-50 text-emerald-600",

        danger:
            "bg-red-50 text-red-600",

        info:
            "bg-blue-50 text-blue-600",
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-sm font-medium text-slate-400">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {value}
                    </p>

                </div>

                <div
                    className={`rounded-xl p-3 ${styles[type]}`}
                >

                    <Icon
                        size={20}
                    />

                </div>

            </div>

        </div>
    );
}