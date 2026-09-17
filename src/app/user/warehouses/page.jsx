"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    Warehouse,
    Plus,
    Search,
    RefreshCw,
    Eye,
    Edit,
    Trash2,
    Phone,
    Mail,
    MapPin,
    User,
    UserCheck,
    UserX,
    X,
    Save,
    Package,
    ArrowRightLeft,
    Boxes,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

const WAREHOUSES_KEY =
    STORAGE_KEYS.WAREHOUSES || "inventory_warehouses";

const PRODUCTS_KEY =
    STORAGE_KEYS.PRODUCTS || "inventory_products";

const TRANSFERS_KEY =
    "inventory_transfers";

const generateId = () => {
    return `warehouse_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;
};

const generateWarehouseCode = () => {
    return `WH-${Date.now()
        .toString()
        .slice(-6)}`;
};

const emptyForm = {
    code: "",
    name: "",
    branch: "",
    manager: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    capacity: "",
    notes: "",
    status: "ACTIVE",
};

export default function WarehousesPage() {
    const [warehouses, setWarehouses] =
        useState([]);

    const [products, setProducts] =
        useState([]);

    const [transfers, setTransfers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [showModal, setShowModal] =
        useState(false);

    const [editingWarehouse, setEditingWarehouse] =
        useState(null);

    const [form, setForm] =
        useState(emptyForm);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);

        const storedWarehouses =
            getStorage(
                WAREHOUSES_KEY,
                []
            );

        const storedProducts =
            getStorage(
                PRODUCTS_KEY,
                []
            );

        const storedTransfers =
            getStorage(
                TRANSFERS_KEY,
                []
            );

        setWarehouses(
            Array.isArray(
                storedWarehouses
            )
                ? storedWarehouses
                : []
        );

        setProducts(
            Array.isArray(
                storedProducts
            )
                ? storedProducts
                : []
        );

        setTransfers(
            Array.isArray(
                storedTransfers
            )
                ? storedTransfers
                : []
        );

        setLoading(false);
    };

    /*
     * ========================================
     * FILTERED WAREHOUSES
     * ========================================
     */

    const filteredWarehouses = useMemo(() => {
        return warehouses.filter(
            (warehouse) => {
                const query =
                    search
                        .trim()
                        .toLowerCase();

                const code =
                    warehouse.code ||
                    warehouse.warehouseCode ||
                    "";

                const name =
                    warehouse.name ||
                    warehouse.warehouseName ||
                    "";

                const branch =
                    warehouse.branch ||
                    "";

                const manager =
                    warehouse.manager ||
                    warehouse.managerName ||
                    "";

                const phone =
                    warehouse.phone ||
                    "";

                const email =
                    warehouse.email ||
                    "";

                const matchesSearch =
                    !query ||
                    String(code)
                        .toLowerCase()
                        .includes(query) ||
                    String(name)
                        .toLowerCase()
                        .includes(query) ||
                    String(branch)
                        .toLowerCase()
                        .includes(query) ||
                    String(manager)
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
                        warehouse.status ||
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
        warehouses,
        search,
        statusFilter,
    ]);

    /*
     * ========================================
     * STATS
     * ========================================
     */

    const totalWarehouses =
        warehouses.length;

    const activeWarehouses =
        warehouses.filter(
            (warehouse) =>
                String(
                    warehouse.status ||
                        "ACTIVE"
                ).toUpperCase() ===
                "ACTIVE"
        ).length;

    const inactiveWarehouses =
        warehouses.filter(
            (warehouse) =>
                String(
                    warehouse.status ||
                        "ACTIVE"
                ).toUpperCase() ===
                "INACTIVE"
        ).length;

    const totalStockUnits =
        products.reduce(
            (total, product) =>
                total +
                Number(
                    product.stock ||
                        0
                ),
            0
        );

    const totalTransfers =
        transfers.length;

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
     * CREATE
     * ========================================
     */

    const openCreateModal = () => {
        setEditingWarehouse(null);

        setForm({
            ...emptyForm,
            code:
                generateWarehouseCode(),
        });

        setShowModal(true);
    };

    /*
     * ========================================
     * EDIT
     * ========================================
     */

    const openEditModal = (
        warehouse
    ) => {
        setEditingWarehouse(
            warehouse
        );

        setForm({
            code:
                warehouse.code ||
                warehouse.warehouseCode ||
                "",

            name:
                warehouse.name ||
                warehouse.warehouseName ||
                "",

            branch:
                warehouse.branch ||
                "",

            manager:
                warehouse.manager ||
                warehouse.managerName ||
                "",

            phone:
                warehouse.phone ||
                "",

            email:
                warehouse.email ||
                "",

            address:
                warehouse.address ||
                "",

            city:
                warehouse.city ||
                "",

            state:
                warehouse.state ||
                "",

            pincode:
                warehouse.pincode ||
                "",

            capacity:
                warehouse.capacity ||
                "",

            notes:
                warehouse.notes ||
                "",

            status:
                warehouse.status ||
                "ACTIVE",
        });

        setShowModal(true);
    };

    /*
     * ========================================
     * SUBMIT
     * ========================================
     */

    const handleSubmit = (
        event
    ) => {
        event.preventDefault();

        const code =
            form.code.trim();

        const name =
            form.name.trim();

        const branch =
            form.branch.trim();

        const manager =
            form.manager.trim();

        const phone =
            form.phone.trim();

        const email =
            form.email.trim();

        if (!code) {
            alert(
                "Warehouse code is required."
            );
            return;
        }

        if (!name) {
            alert(
                "Warehouse name is required."
            );
            return;
        }

        if (!branch) {
            alert(
                "Branch is required."
            );
            return;
        }

        if (!manager) {
            alert(
                "Warehouse manager is required."
            );
            return;
        }

        if (!phone) {
            alert(
                "Phone number is required."
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

        /*
         * Duplicate code
         */

        const duplicateCode =
            warehouses.some(
                (warehouse) =>
                    String(
                        warehouse.code ||
                            warehouse.warehouseCode ||
                            ""
                    ).toLowerCase() ===
                        code.toLowerCase() &&
                    warehouse.id !==
                        editingWarehouse?.id
            );

        if (duplicateCode) {
            alert(
                "Warehouse code already exists."
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

        if (editingWarehouse) {
            const updatedWarehouses =
                warehouses.map(
                    (warehouse) => {
                        if (
                            warehouse.id !==
                            editingWarehouse.id
                        ) {
                            return warehouse;
                        }

                        return {
                            ...warehouse,

                            code,

                            warehouseCode:
                                code,

                            name,

                            warehouseName:
                                name,

                            branch,

                            manager,

                            managerName:
                                manager,

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

                            capacity:
                                Number(
                                    form.capacity ||
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
                WAREHOUSES_KEY,
                updatedWarehouses
            );

            setWarehouses(
                updatedWarehouses
            );

            alert(
                "Warehouse updated successfully."
            );
        }

        /*
         * ====================================
         * CREATE
         * ====================================
         */

        else {
            const newWarehouse = {
                id: generateId(),

                code,

                warehouseCode: code,

                name,

                warehouseName:
                    name,

                branch,

                manager,

                managerName:
                    manager,

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

                capacity:
                    Number(
                        form.capacity ||
                            0
                    ),

                notes:
                    form.notes.trim(),

                status:
                    form.status,

                createdAt: now,

                updatedAt: now,
            };

            const updatedWarehouses = [
                newWarehouse,
                ...warehouses,
            ];

            setStorage(
                WAREHOUSES_KEY,
                updatedWarehouses
            );

            setWarehouses(
                updatedWarehouses
            );

            alert(
                "Warehouse created successfully."
            );
        }

        setShowModal(false);

        setEditingWarehouse(null);

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
        warehouse
    ) => {
        const currentStatus =
            String(
                warehouse.status ||
                    "ACTIVE"
            ).toUpperCase();

        const newStatus =
            currentStatus ===
            "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const updatedWarehouses =
            warehouses.map(
                (item) =>
                    item.id ===
                    warehouse.id
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
            WAREHOUSES_KEY,
            updatedWarehouses
        );

        setWarehouses(
            updatedWarehouses
        );
    };

    /*
     * ========================================
     * DELETE
     * ========================================
     */

    const deleteWarehouse = (
        warehouse
    ) => {
        const hasTransfers =
            transfers.some(
                (transfer) =>
                    String(
                        transfer.sourceWarehouseId
                    ) ===
                        String(
                            warehouse.id
                        ) ||
                    String(
                        transfer.destinationWarehouseId
                    ) ===
                        String(
                            warehouse.id
                        )
            );

        if (hasTransfers) {
            alert(
                "This warehouse has transfer history, so it cannot be deleted. You can deactivate it instead."
            );
            return;
        }

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${warehouse.name}"?`
            );

        if (!confirmed) {
            return;
        }

        const updatedWarehouses =
            warehouses.filter(
                (item) =>
                    item.id !==
                    warehouse.id
            );

        setStorage(
            WAREHOUSES_KEY,
            updatedWarehouses
        );

        setWarehouses(
            updatedWarehouses
        );

        alert(
            "Warehouse deleted successfully."
        );
    };

    /*
     * ========================================
     * TRANSFER COUNT
     * ========================================
     */

    const getTransferCount = (
        warehouseId
    ) => {
        return transfers.filter(
            (transfer) =>
                String(
                    transfer.sourceWarehouseId
                ) ===
                    String(
                        warehouseId
                    ) ||
                String(
                    transfer.destinationWarehouseId
                ) ===
                    String(
                        warehouseId
                    )
        ).length;
    };

    /*
     * ========================================
     * STOCK
     *
     * Current demo product model has
     * global stock. Warehouse-specific stock
     * can be added later.
     * ========================================
     */

    const getWarehouseStock = () => {
        return totalStockUnits;
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
                        Loading warehouses...
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

                        <Warehouse
                            size={25}
                            className="text-slate-700"
                        />

                        <h1 className="text-2xl font-bold text-slate-900">
                            Warehouses
                        </h1>

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage warehouses,
                        branches and stock
                        locations.
                    </p>

                </div>

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={
                            loadData
                        }
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
                        Add Warehouse
                    </button>

                </div>

            </div>

            {/* STATS */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <WarehouseStat
                    title="Total Warehouses"
                    value={
                        totalWarehouses
                    }
                    subtitle="All locations"
                    icon={Warehouse}
                />

                <WarehouseStat
                    title="Active"
                    value={
                        activeWarehouses
                    }
                    subtitle="Active locations"
                    icon={
                        UserCheck
                    }
                />

                <WarehouseStat
                    title="Inactive"
                    value={
                        inactiveWarehouses
                    }
                    subtitle="Inactive locations"
                    icon={UserX}
                />

                <WarehouseStat
                    title="Transfer Records"
                    value={
                        totalTransfers
                    }
                    subtitle="All warehouse transfers"
                    icon={
                        ArrowRightLeft
                    }
                />

            </div>

            {/* INFO CARDS */}

            <div className="grid gap-4 md:grid-cols-2">

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm font-medium text-slate-400">
                                Total Product Stock
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {Number(
                                    getWarehouseStock()
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Current global
                                inventory units
                            </p>

                        </div>

                        <div className="rounded-xl bg-slate-100 p-3 text-slate-600">

                            <Boxes size={21} />

                        </div>

                    </div>

                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm font-medium text-slate-400">
                                Products
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {
                                    products.length
                                }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Products available
                                in inventory
                            </p>

                        </div>

                        <div className="rounded-xl bg-slate-100 p-3 text-slate-600">

                            <Package
                                size={21}
                            />

                        </div>

                    </div>

                </div>

            </div>

            {/* FILTER */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="flex flex-col gap-3 md:flex-row">

                    <div className="relative flex-1">

                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={
                                search
                            }
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search warehouse, code, branch, manager..."
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
                        Warehouse List
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Showing{" "}
                        {
                            filteredWarehouses.length
                        }{" "}
                        of{" "}
                        {
                            warehouses.length
                        }{" "}
                        warehouses
                    </p>

                </div>

                {filteredWarehouses.length ===
                0 ? (
                    <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                            <Warehouse
                                size={28}
                                className="text-slate-400"
                            />

                        </div>

                        <h3 className="mt-4 text-base font-bold text-slate-800">
                            No warehouses found
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                            Add your first
                            warehouse to get
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
                            Add Warehouse
                        </button>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1200px]">

                            <thead>

                                <tr className="border-b border-slate-200 bg-slate-50">

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        WAREHOUSE
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        BRANCH
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        MANAGER
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        CONTACT
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        LOCATION
                                    </th>

                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500">
                                        TRANSFERS
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

                                {filteredWarehouses.map(
                                    (
                                        warehouse
                                    ) => {

                                        const status =
                                            String(
                                                warehouse.status ||
                                                    "ACTIVE"
                                            ).toUpperCase();

                                        return (
                                            <tr
                                                key={
                                                    warehouse.id
                                                }
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                            >

                                                {/* WAREHOUSE */}

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">

                                                            <Warehouse
                                                                size={
                                                                    20
                                                                }
                                                                className="text-slate-600"
                                                            />

                                                        </div>

                                                        <div>

                                                            <p className="text-sm font-bold text-slate-900">
                                                                {
                                                                    warehouse.name ||
                                                                    warehouse.warehouseName ||
                                                                    "Warehouse"
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-xs font-medium text-slate-400">
                                                                {
                                                                    warehouse.code ||
                                                                    warehouse.warehouseCode ||
                                                                    "No Code"
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* BRANCH */}

                                                <td className="px-6 py-5">

                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {
                                                            warehouse.branch ||
                                                            "—"
                                                        }
                                                    </span>

                                                </td>

                                                {/* MANAGER */}

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-2">

                                                        <User
                                                            size={
                                                                15
                                                            }
                                                            className="text-slate-400"
                                                        />

                                                        <span className="text-sm text-slate-600">
                                                            {
                                                                warehouse.manager ||
                                                                warehouse.managerName ||
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
                                                                warehouse.phone ||
                                                                "—"
                                                            }

                                                        </div>

                                                        {warehouse.email && (
                                                            <div className="flex items-center gap-2 text-xs text-slate-400">

                                                                <Mail
                                                                    size={
                                                                        13
                                                                    }
                                                                />

                                                                {
                                                                    warehouse.email
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
                                                                warehouse.city,
                                                                warehouse.state,
                                                            ]
                                                                .filter(
                                                                    Boolean
                                                                )
                                                                .join(
                                                                    ", "
                                                                ) ||
                                                                warehouse.address ||
                                                                "—"}

                                                        </span>

                                                    </div>

                                                </td>

                                                {/* TRANSFERS */}

                                                <td className="px-6 py-5 text-center">

                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">

                                                        <ArrowRightLeft
                                                            size={
                                                                13
                                                            }
                                                        />

                                                        {
                                                            getTransferCount(
                                                                warehouse.id
                                                            )
                                                        }

                                                    </span>

                                                </td>

                                                {/* STATUS */}

                                                <td className="px-6 py-5 text-center">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleStatus(
                                                                warehouse
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
                                                            href={`/user/warehouses/${warehouse.id}`}
                                                            title="View Warehouse"
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
                                                                    warehouse
                                                                )
                                                            }
                                                            title="Edit Warehouse"
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
                                                                deleteWarehouse(
                                                                    warehouse
                                                                )
                                                            }
                                                            title="Delete Warehouse"
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

                    <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        {/* HEADER */}

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

                            <div>

                                <h2 className="text-lg font-bold text-slate-900">
                                    {editingWarehouse
                                        ? "Edit Warehouse"
                                        : "Add Warehouse"}
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Enter warehouse
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
                                    Warehouse Information
                                </h3>

                                <div className="grid gap-4 md:grid-cols-2">

                                    <FormField
                                        label="Warehouse Code *"
                                        value={
                                            form.code
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            handleChange(
                                                "code",
                                                value
                                            )
                                        }
                                        placeholder="WH-001"
                                    />

                                    <FormField
                                        label="Warehouse Name *"
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
                                        placeholder="Main Warehouse"
                                    />

                                    <FormField
                                        label="Branch *"
                                        value={
                                            form.branch
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            handleChange(
                                                "branch",
                                                value
                                            )
                                        }
                                        placeholder="Main Branch"
                                    />

                                    <FormField
                                        label="Manager *"
                                        value={
                                            form.manager
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            handleChange(
                                                "manager",
                                                value
                                            )
                                        }
                                        placeholder="Manager name"
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
                                        placeholder="Warehouse phone"
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
                                        placeholder="warehouse@email.com"
                                    />

                                    <FormField
                                        label="Capacity"
                                        type="number"
                                        value={
                                            form.capacity
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            handleChange(
                                                "capacity",
                                                value
                                            )
                                        }
                                        placeholder="10000"
                                    />

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
                                            rows={3}
                                            placeholder="Enter full warehouse address"
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

                            {/* NOTES */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Notes
                                </label>

                                <textarea
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
                                    rows={3}
                                    placeholder="Optional warehouse notes"
                                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                                />

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

                                    {editingWarehouse
                                        ? "Update Warehouse"
                                        : "Save Warehouse"}

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
 * STAT
 * =========================================
 */

function WarehouseStat({
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