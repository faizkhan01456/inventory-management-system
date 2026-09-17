"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    UsersRound,
    Plus,
    Search,
    RefreshCw,
    Eye,
    Edit,
    Trash2,
    Phone,
    Mail,
    MapPin,
    Building2,
    UserCheck,
    UserX,
    X,
    Save,
    IndianRupee,
    ShoppingCart,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

const generateId = () => {
    return `supplier_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;
};

const emptyForm = {
    name: "",
    companyName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
    openingBalance: 0,
    notes: "",
    status: "ACTIVE",
};

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState([]);
    const [purchases, setPurchases] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [showModal, setShowModal] =
        useState(false);

    const [editingSupplier, setEditingSupplier] =
        useState(null);

    const [form, setForm] =
        useState(emptyForm);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);

        const storedSuppliers =
            getStorage(
                STORAGE_KEYS.SUPPLIERS,
                []
            );

        const storedPurchases =
            getStorage(
                STORAGE_KEYS.PURCHASES,
                []
            );

        setSuppliers(
            Array.isArray(storedSuppliers)
                ? storedSuppliers
                : []
        );

        setPurchases(
            Array.isArray(storedPurchases)
                ? storedPurchases
                : []
        );

        setLoading(false);
    };

    /*
     * ========================================
     * FILTERED SUPPLIERS
     * ========================================
     */

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(
            (supplier) => {
                const query =
                    search
                        .trim()
                        .toLowerCase();

                const name =
                    supplier.name ||
                    supplier.supplierName ||
                    "";

                const companyName =
                    supplier.companyName ||
                    supplier.businessName ||
                    "";

                const phone =
                    supplier.phone ||
                    supplier.mobile ||
                    "";

                const email =
                    supplier.email ||
                    "";

                const matchesSearch =
                    !query ||
                    String(name)
                        .toLowerCase()
                        .includes(query) ||
                    String(companyName)
                        .toLowerCase()
                        .includes(query) ||
                    String(phone)
                        .toLowerCase()
                        .includes(query) ||
                    String(email)
                        .toLowerCase()
                        .includes(query);

                const status =
                    String(
                        supplier.status ||
                            "ACTIVE"
                    ).toUpperCase();

                const matchesStatus =
                    statusFilter ===
                        "ALL" ||
                    status ===
                        statusFilter;

                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );
    }, [
        suppliers,
        search,
        statusFilter,
    ]);

    /*
     * ========================================
     * STATS
     * ========================================
     */

    const totalSuppliers =
        suppliers.length;

    const activeSuppliers =
        suppliers.filter(
            (supplier) =>
                String(
                    supplier.status ||
                        "ACTIVE"
                ).toUpperCase() ===
                "ACTIVE"
        ).length;

    const inactiveSuppliers =
        suppliers.filter(
            (supplier) =>
                String(
                    supplier.status ||
                        "ACTIVE"
                ).toUpperCase() ===
                "INACTIVE"
        ).length;

    const totalPurchaseAmount =
        purchases.reduce(
            (total, purchase) => {
                return (
                    total +
                    Number(
                        purchase.grandTotal ??
                            purchase.totalAmount ??
                            purchase.total ??
                            0
                    )
                );
            },
            0
        );

    /*
     * ========================================
     * FORM CHANGE
     * ========================================
     */

    const handleChange = (
        field,
        value
    ) => {
        setForm(
            (previous) => ({
                ...previous,
                [field]: value,
            })
        );
    };

    /*
     * ========================================
     * CREATE MODAL
     * ========================================
     */

    const openCreateModal = () => {
        setEditingSupplier(null);

        setForm({
            ...emptyForm,
        });

        setShowModal(true);
    };

    /*
     * ========================================
     * EDIT MODAL
     * ========================================
     */

    const openEditModal = (
        supplier
    ) => {
        setEditingSupplier(
            supplier
        );

        setForm({
            name:
                supplier.name ||
                supplier.supplierName ||
                "",

            companyName:
                supplier.companyName ||
                supplier.businessName ||
                "",

            phone:
                supplier.phone ||
                supplier.mobile ||
                "",

            email:
                supplier.email ||
                "",

            address:
                supplier.address ||
                "",

            city:
                supplier.city ||
                "",

            state:
                supplier.state ||
                "",

            pincode:
                supplier.pincode ||
                "",

            gstNumber:
                supplier.gstNumber ||
                "",

            openingBalance:
                supplier.openingBalance ||
                0,

            notes:
                supplier.notes ||
                "",

            status:
                supplier.status ||
                "ACTIVE",
        });

        setShowModal(true);
    };

    /*
     * ========================================
     * SAVE SUPPLIER
     * ========================================
     */

    const handleSubmit = (
        event
    ) => {
        event.preventDefault();

        const name =
            form.name.trim();

        const companyName =
            form.companyName.trim();

        const phone =
            form.phone.trim();

        const email =
            form.email.trim();

        if (!name) {
            alert(
                "Supplier name is required."
            );
            return;
        }

        if (!companyName) {
            alert(
                "Company name is required."
            );
            return;
        }

        if (!phone) {
            alert(
                "Supplier phone is required."
            );
            return;
        }

        if (
            email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email
            )
        ) {
            alert(
                "Please enter a valid email address."
            );
            return;
        }

        const now =
            new Date().toISOString();

        /*
         * ====================================
         * UPDATE
         * ====================================
         */

        if (editingSupplier) {
            const updatedSuppliers =
                suppliers.map(
                    (supplier) => {
                        if (
                            supplier.id !==
                            editingSupplier.id
                        ) {
                            return supplier;
                        }

                        return {
                            ...supplier,

                            name,

                            supplierName:
                                name,

                            companyName,

                            businessName:
                                companyName,

                            phone,

                            email,

                            address:
                                form.address.trim(),

                            city:
                                form.city.trim(),

                            state:
                                form.state.trim(),

                            pincode:
                                form.pincode.trim(),

                            gstNumber:
                                form.gstNumber.trim(),

                            openingBalance:
                                Number(
                                    form.openingBalance ||
                                        0
                                ),

                            notes:
                                form.notes.trim(),

                            status:
                                form.status,

                            updatedAt:
                                now,
                        };
                    }
                );

            setStorage(
                STORAGE_KEYS.SUPPLIERS,
                updatedSuppliers
            );

            setSuppliers(
                updatedSuppliers
            );

            alert(
                "Supplier updated successfully."
            );
        }

        /*
         * ====================================
         * CREATE
         * ====================================
         */

        else {
            const duplicatePhone =
                suppliers.some(
                    (supplier) =>
                        String(
                            supplier.phone ||
                                supplier.mobile ||
                                ""
                        ).trim() ===
                        phone
                );

            if (
                duplicatePhone
            ) {
                alert(
                    "A supplier with this phone number already exists."
                );
                return;
            }

            const supplier = {
                id: generateId(),

                name,

                supplierName:
                    name,

                companyName,

                businessName:
                    companyName,

                phone,

                email,

                address:
                    form.address.trim(),

                city:
                    form.city.trim(),

                state:
                    form.state.trim(),

                pincode:
                    form.pincode.trim(),

                gstNumber:
                    form.gstNumber.trim(),

                openingBalance:
                    Number(
                        form.openingBalance ||
                            0
                    ),

                notes:
                    form.notes.trim(),

                status:
                    form.status,

                createdAt: now,

                updatedAt: now,
            };

            const updatedSuppliers =
                [
                    supplier,
                    ...suppliers,
                ];

            setStorage(
                STORAGE_KEYS.SUPPLIERS,
                updatedSuppliers
            );

            setSuppliers(
                updatedSuppliers
            );

            alert(
                "Supplier created successfully."
            );
        }

        setShowModal(false);

        setEditingSupplier(null);

        setForm({
            ...emptyForm,
        });
    };

    /*
     * ========================================
     * TOGGLE STATUS
     * ========================================
     */

    const toggleStatus = (
        supplier
    ) => {
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
            suppliers.map(
                (item) =>
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
            );

        setStorage(
            STORAGE_KEYS.SUPPLIERS,
            updatedSuppliers
        );

        setSuppliers(
            updatedSuppliers
        );
    };

    /*
     * ========================================
     * DELETE
     * ========================================
     */

    const deleteSupplier = (
        supplier
    ) => {
        const hasPurchases =
            purchases.some(
                (purchase) =>
                    String(
                        purchase.supplierId
                    ) ===
                    String(
                        supplier.id
                    )
            );

        if (hasPurchases) {
            alert(
                "This supplier has purchase history, so it cannot be deleted. You can deactivate the supplier instead."
            );
            return;
        }

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${supplier.name}"?`
            );

        if (!confirmed) {
            return;
        }

        const updatedSuppliers =
            suppliers.filter(
                (item) =>
                    item.id !==
                    supplier.id
            );

        setStorage(
            STORAGE_KEYS.SUPPLIERS,
            updatedSuppliers
        );

        setSuppliers(
            updatedSuppliers
        );

        alert(
            "Supplier deleted successfully."
        );
    };

    /*
     * ========================================
     * PURCHASE COUNT
     * ========================================
     */

    const getPurchaseCount = (
        supplierId
    ) => {
        return purchases.filter(
            (purchase) =>
                String(
                    purchase.supplierId
                ) ===
                String(
                    supplierId
                )
        ).length;
    };

    /*
     * ========================================
     * PURCHASE TOTAL
     * ========================================
     */

    const getPurchaseTotal = (
        supplierId
    ) => {
        return purchases
            .filter(
                (purchase) =>
                    String(
                        purchase.supplierId
                    ) ===
                    String(
                        supplierId
                    )
            )
            .reduce(
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
    };

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

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">

                <div className="text-center">

                    <RefreshCw
                        size={28}
                        className="mx-auto animate-spin text-slate-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading suppliers...
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* HEADER */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>

                    <div className="flex items-center gap-2">

                        <UsersRound
                            size={25}
                            className="text-slate-700"
                        />

                        <h1 className="text-2xl font-bold text-slate-900">
                            Suppliers
                        </h1>

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage suppliers and
                        purchase history.
                    </p>

                </div>

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={loadData}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        <RefreshCw
                            size={17}
                        />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={
                            openCreateModal
                        }
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                    >
                        <Plus size={17} />
                        Add Supplier
                    </button>

                </div>

            </div>

            {/* STATS */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <SupplierStat
                    title="Total Suppliers"
                    value={
                        totalSuppliers
                    }
                    subtitle="All suppliers"
                    icon={
                        UsersRound
                    }
                />

                <SupplierStat
                    title="Active"
                    value={
                        activeSuppliers
                    }
                    subtitle="Active suppliers"
                    icon={
                        UserCheck
                    }
                />

                <SupplierStat
                    title="Inactive"
                    value={
                        inactiveSuppliers
                    }
                    subtitle="Inactive suppliers"
                    icon={
                        UserX
                    }
                />

                <SupplierStat
                    title="Purchase Value"
                    value={formatCurrency(
                        totalPurchaseAmount
                    )}
                    subtitle="Total purchase value"
                    icon={
                        IndianRupee
                    }
                />

            </div>

            {/* SEARCH */}

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
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search supplier, company, phone or email..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white"
                        />

                    </div>

                    <select
                        value={
                            statusFilter
                        }
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
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

            {/* TABLE */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                    <h2 className="text-base font-bold text-slate-900">
                        Supplier List
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Showing{" "}
                        {
                            filteredSuppliers.length
                        }{" "}
                        of{" "}
                        {
                            suppliers.length
                        }{" "}
                        suppliers
                    </p>

                </div>

                {filteredSuppliers.length ===
                0 ? (
                    <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                            <UsersRound
                                size={28}
                                className="text-slate-400"
                            />

                        </div>

                        <h3 className="mt-4 text-base font-bold text-slate-800">
                            No suppliers found
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                            Add your first
                            supplier to get
                            started.
                        </p>

                        <button
                            type="button"
                            onClick={
                                openCreateModal
                            }
                            className="mt-5 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            <Plus size={16} />
                            Add Supplier
                        </button>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1250px]">

                            <thead>

                                <tr className="border-b border-slate-200 bg-slate-50">

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        SUPPLIER
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        COMPANY
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        CONTACT
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        LOCATION
                                    </th>

                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500">
                                        PURCHASES
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        PURCHASE VALUE
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

                                {filteredSuppliers.map(
                                    (
                                        supplier
                                    ) => {

                                        const status =
                                            String(
                                                supplier.status ||
                                                    "ACTIVE"
                                            ).toUpperCase();

                                        const purchaseCount =
                                            getPurchaseCount(
                                                supplier.id
                                            );

                                        const purchaseTotal =
                                            getPurchaseTotal(
                                                supplier.id
                                            );

                                        return (
                                            <tr
                                                key={
                                                    supplier.id
                                                }
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                            >

                                                {/* SUPPLIER */}

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-600">

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

                                                            <p className="text-sm font-bold text-slate-900">
                                                                {
                                                                    supplier.name ||
                                                                    supplier.supplierName ||
                                                                    "Supplier"
                                                                }
                                                            </p>

                                                            {supplier.gstNumber && (
                                                                <p className="mt-0.5 text-xs text-slate-400">
                                                                    GST:{" "}
                                                                    {
                                                                        supplier.gstNumber
                                                                    }
                                                                </p>
                                                            )}

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* COMPANY */}

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-2">

                                                        <Building2
                                                            size={
                                                                16
                                                            }
                                                            className="text-slate-400"
                                                        />

                                                        <span className="text-sm font-semibold text-slate-700">
                                                            {
                                                                supplier.companyName ||
                                                                supplier.businessName ||
                                                                "—"
                                                            }
                                                        </span>

                                                    </div>

                                                </td>

                                                {/* CONTACT */}

                                                <td className="px-6 py-5">

                                                    <div className="space-y-1.5">

                                                        <div className="flex items-center gap-2 text-xs text-slate-600">

                                                            <Phone
                                                                size={
                                                                    13
                                                                }
                                                            />

                                                            {
                                                                supplier.phone ||
                                                                supplier.mobile ||
                                                                "—"
                                                            }

                                                        </div>

                                                        {supplier.email && (
                                                            <div className="flex items-center gap-2 text-xs text-slate-400">

                                                                <Mail
                                                                    size={
                                                                        13
                                                                    }
                                                                />

                                                                {
                                                                    supplier.email
                                                                }

                                                            </div>
                                                        )}

                                                    </div>

                                                </td>

                                                {/* LOCATION */}

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-2">

                                                        <MapPin
                                                            size={
                                                                15
                                                            }
                                                            className="text-slate-400"
                                                        />

                                                        <span className="text-sm text-slate-600">

                                                            {[
                                                                supplier.city,
                                                                supplier.state,
                                                            ]
                                                                .filter(
                                                                    Boolean
                                                                )
                                                                .join(
                                                                    ", "
                                                                ) ||
                                                                supplier.address ||
                                                                "—"}

                                                        </span>

                                                    </div>

                                                </td>

                                                {/* PURCHASES */}

                                                <td className="px-6 py-5 text-center">

                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">

                                                        <ShoppingCart
                                                            size={
                                                                13
                                                            }
                                                        />

                                                        {
                                                            purchaseCount
                                                        }

                                                    </span>

                                                </td>

                                                {/* VALUE */}

                                                <td className="px-6 py-5 text-right">

                                                    <span className="text-sm font-bold text-slate-900">
                                                        {formatCurrency(
                                                            purchaseTotal
                                                        )}
                                                    </span>

                                                </td>

                                                {/* STATUS */}

                                                <td className="px-6 py-5 text-center">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleStatus(
                                                                supplier
                                                            )
                                                        }
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

                                                    </button>

                                                </td>

                                                {/* ACTION */}

                                                <td className="px-6 py-5">

                                                    <div className="flex justify-end gap-1">

                                                        <Link
                                                            href={`/user/suppliers/${supplier.id}`}
                                                            title="View Supplier"
                                                            className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                                        >
                                                            <Eye
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    supplier
                                                                )
                                                            }
                                                            title="Edit Supplier"
                                                            className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                                                        >
                                                            <Edit
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                deleteSupplier(
                                                                    supplier
                                                                )
                                                            }
                                                            title="Delete Supplier"
                                                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
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

            {/* MODAL */}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        {/* MODAL HEADER */}

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

                            <div>

                                <h2 className="text-lg font-bold text-slate-900">
                                    {editingSupplier
                                        ? "Edit Supplier"
                                        : "Add Supplier"}
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Enter supplier
                                    information below.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowModal(
                                        false
                                    )
                                }
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="space-y-6 p-6"
                        >

                            {/* BASIC */}

                            <div>

                                <h3 className="mb-4 text-sm font-bold text-slate-900">
                                    Basic Information
                                </h3>

                                <div className="grid gap-4 md:grid-cols-2">

                                    <FormField
                                        label="Supplier Name *"
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
                                        placeholder="Enter supplier name"
                                    />

                                    <FormField
                                        label="Company Name *"
                                        value={
                                            form.companyName
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            handleChange(
                                                "companyName",
                                                value
                                            )
                                        }
                                        placeholder="Enter company name"
                                    />

                                    <FormField
                                        label="Phone *"
                                        value={
                                            form.phone
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            handleChange(
                                                "phone",
                                                value
                                            )
                                        }
                                        placeholder="Enter phone number"
                                    />

                                    <FormField
                                        label="Email"
                                        type="email"
                                        value={
                                            form.email
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            handleChange(
                                                "email",
                                                value
                                            )
                                        }
                                        placeholder="supplier@email.com"
                                    />

                                    <FormField
                                        label="GST Number"
                                        value={
                                            form.gstNumber
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            handleChange(
                                                "gstNumber",
                                                value
                                            )
                                        }
                                        placeholder="GSTIN"
                                    />

                                    <FormField
                                        label="Opening Balance"
                                        type="number"
                                        value={
                                            form.openingBalance
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            handleChange(
                                                "openingBalance",
                                                value
                                            )
                                        }
                                        placeholder="0"
                                    />

                                </div>

                            </div>

                            {/* ADDRESS */}

                            <div>

                                <h3 className="mb-4 text-sm font-bold text-slate-900">
                                    Address
                                </h3>

                                <div className="grid gap-4 md:grid-cols-2">

                                    <div className="md:col-span-2">

                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Address
                                        </label>

                                        <textarea
                                            value={
                                                form.address
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                handleChange(
                                                    "address",
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            rows={
                                                3
                                            }
                                            placeholder="Enter full address"
                                            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                        />

                                    </div>

                                    <FormField
                                        label="City"
                                        value={
                                            form.city
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            handleChange(
                                                "city",
                                                value
                                            )
                                        }
                                        placeholder="City"
                                    />

                                    <FormField
                                        label="State"
                                        value={
                                            form.state
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            handleChange(
                                                "state",
                                                value
                                            )
                                        }
                                        placeholder="State"
                                    />

                                    <FormField
                                        label="Pincode"
                                        value={
                                            form.pincode
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            handleChange(
                                                "pincode",
                                                value
                                            )
                                        }
                                        placeholder="Pincode"
                                    />

                                </div>

                            </div>

                            {/* STATUS / NOTES */}

                            <div className="grid gap-4 md:grid-cols-2">

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Status
                                    </label>

                                    <select
                                        value={
                                            form.status
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            handleChange(
                                                "status",
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                                    >

                                        <option value="ACTIVE">
                                            Active
                                        </option>

                                        <option value="INACTIVE">
                                            Inactive
                                        </option>

                                    </select>

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Notes
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            form.notes
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            handleChange(
                                                "notes",
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Optional notes"
                                        className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                                    />

                                </div>

                            </div>

                            {/* BUTTONS */}

                            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowModal(
                                            false
                                        )
                                    }
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                                >

                                    <Save
                                        size={
                                            17
                                        }
                                    />

                                    {editingSupplier
                                        ? "Update Supplier"
                                        : "Save Supplier"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

/*
 * =========================================
 * STAT COMPONENT
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

/*
 * =========================================
 * FORM FIELD
 * =========================================
 */

function FormField({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
}) {
    return (
        <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </label>

            <input
                type={type}
                value={value}
                onChange={(e) =>
                    onChange(
                        e.target.value
                    )
                }
                placeholder={
                    placeholder
                }
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
            />

        </div>
    );
}