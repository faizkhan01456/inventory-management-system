"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    Users,
    Plus,
    Search,
    RefreshCw,
    Eye,
    Edit,
    Trash2,
    Phone,
    Mail,
    MapPin,
    UserCheck,
    UserX,
    X,
    Save,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

const generateId = () => {
    return `customer_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;
};

const emptyForm = {
    name: "",
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

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [sales, setSales] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [showModal, setShowModal] =
        useState(false);

    const [editingCustomer, setEditingCustomer] =
        useState(null);

    const [form, setForm] =
        useState(emptyForm);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);

        const storedCustomers =
            getStorage(
                STORAGE_KEYS.CUSTOMERS,
                []
            );

        const storedSales =
            getStorage(
                STORAGE_KEYS.SALES,
                []
            );

        setCustomers(
            Array.isArray(
                storedCustomers
            )
                ? storedCustomers
                : []
        );

        setSales(
            Array.isArray(storedSales)
                ? storedSales
                : []
        );

        setLoading(false);
    };

    /*
     * ========================================
     * FILTER
     * ========================================
     */

    const filteredCustomers = useMemo(() => {
        return customers.filter(
            (customer) => {
                const query =
                    search
                        .trim()
                        .toLowerCase();

                const name =
                    customer.name ||
                    customer.customerName ||
                    "";

                const phone =
                    customer.phone ||
                    customer.mobile ||
                    "";

                const email =
                    customer.email ||
                    "";

                const matchesSearch =
                    !query ||
                    String(name)
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
                        customer.status ||
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
        customers,
        search,
        statusFilter,
    ]);

    /*
     * ========================================
     * STATS
     * ========================================
     */

    const totalCustomers =
        customers.length;

    const activeCustomers =
        customers.filter(
            (customer) =>
                String(
                    customer.status ||
                        "ACTIVE"
                ).toUpperCase() ===
                "ACTIVE"
        ).length;

    const inactiveCustomers =
        customers.filter(
            (customer) =>
                String(
                    customer.status ||
                        "ACTIVE"
                ).toUpperCase() ===
                "INACTIVE"
        ).length;

    const totalSales =
        sales.reduce(
            (total, sale) => {
                const customerId =
                    sale.customerId;

                if (
                    !customerId
                ) {
                    return total;
                }

                return (
                    total +
                    Number(
                        sale.grandTotal ||
                            sale.totalAmount ||
                            sale.total ||
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
     * OPEN CREATE
     * ========================================
     */

    const openCreateModal = () => {
        setEditingCustomer(null);

        setForm({
            ...emptyForm,
        });

        setShowModal(true);
    };

    /*
     * ========================================
     * OPEN EDIT
     * ========================================
     */

    const openEditModal = (
        customer
    ) => {
        setEditingCustomer(
            customer
        );

        setForm({
            name:
                customer.name ||
                customer.customerName ||
                "",

            phone:
                customer.phone ||
                customer.mobile ||
                "",

            email:
                customer.email ||
                "",

            address:
                customer.address ||
                "",

            city:
                customer.city ||
                "",

            state:
                customer.state ||
                "",

            pincode:
                customer.pincode ||
                "",

            gstNumber:
                customer.gstNumber ||
                "",

            openingBalance:
                customer.openingBalance ||
                0,

            notes:
                customer.notes ||
                "",

            status:
                customer.status ||
                "ACTIVE",
        });

        setShowModal(true);
    };

    /*
     * ========================================
     * SAVE CUSTOMER
     * ========================================
     */

    const handleSubmit = (
        event
    ) => {
        event.preventDefault();

        const name =
            form.name.trim();

        const phone =
            form.phone.trim();

        const email =
            form.email.trim();

        if (!name) {
            alert(
                "Customer name is required."
            );
            return;
        }

        if (!phone) {
            alert(
                "Customer phone is required."
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
         * EDIT
         */

        if (editingCustomer) {
            const updatedCustomers =
                customers.map(
                    (customer) => {
                        if (
                            customer.id !==
                            editingCustomer.id
                        ) {
                            return customer;
                        }

                        return {
                            ...customer,

                            name,

                            customerName:
                                name,

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
                STORAGE_KEYS.CUSTOMERS,
                updatedCustomers
            );

            setCustomers(
                updatedCustomers
            );

            alert(
                "Customer updated successfully."
            );
        }

        /*
         * CREATE
         */

        else {
            const duplicatePhone =
                customers.some(
                    (customer) =>
                        String(
                            customer.phone ||
                                customer.mobile ||
                                ""
                        ).trim() ===
                        phone
                );

            if (
                duplicatePhone
            ) {
                alert(
                    "A customer with this phone number already exists."
                );
                return;
            }

            const customer = {
                id: generateId(),

                name,

                customerName:
                    name,

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

            const updatedCustomers =
                [
                    customer,
                    ...customers,
                ];

            setStorage(
                STORAGE_KEYS.CUSTOMERS,
                updatedCustomers
            );

            setCustomers(
                updatedCustomers
            );

            alert(
                "Customer created successfully."
            );
        }

        setShowModal(false);
        setEditingCustomer(null);
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
        customer
    ) => {
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
            customers.map(
                (item) =>
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
            );

        setStorage(
            STORAGE_KEYS.CUSTOMERS,
            updatedCustomers
        );

        setCustomers(
            updatedCustomers
        );
    };

    /*
     * ========================================
     * DELETE
     * ========================================
     */

    const deleteCustomer = (
        customer
    ) => {
        const hasSales =
            sales.some(
                (sale) =>
                    String(
                        sale.customerId
                    ) ===
                    String(
                        customer.id
                    )
            );

        if (hasSales) {
            alert(
                "This customer has sales history, so it cannot be deleted. You can deactivate the customer instead."
            );
            return;
        }

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${customer.name}"?`
            );

        if (!confirmed) {
            return;
        }

        const updatedCustomers =
            customers.filter(
                (item) =>
                    item.id !==
                    customer.id
            );

        setStorage(
            STORAGE_KEYS.CUSTOMERS,
            updatedCustomers
        );

        setCustomers(
            updatedCustomers
        );

        alert(
            "Customer deleted successfully."
        );
    };

    /*
     * ========================================
     * CUSTOMER SALES COUNT
     * ========================================
     */

    const getCustomerSalesCount =
        (customerId) => {
            return sales.filter(
                (sale) =>
                    String(
                        sale.customerId
                    ) ===
                    String(
                        customerId
                    )
            ).length;
        };

    /*
     * ========================================
     * CUSTOMER SALES TOTAL
     * ========================================
     */

    const getCustomerSalesTotal =
        (customerId) => {
            return sales
                .filter(
                    (sale) =>
                        String(
                            sale.customerId
                        ) ===
                        String(
                            customerId
                        )
                )
                .reduce(
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

                <div className="text-center">

                    <RefreshCw
                        size={28}
                        className="mx-auto animate-spin text-slate-400"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading customers...
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

                        <Users
                            size={25}
                            className="text-slate-700"
                        />

                        <h1 className="text-2xl font-bold text-slate-900">
                            Customers
                        </h1>

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage customers and
                        their sales history.
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
                        Add Customer
                    </button>

                </div>

            </div>

            {/* STATS */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <CustomerStat
                    title="Total Customers"
                    value={
                        totalCustomers
                    }
                    subtitle="All customers"
                    icon={Users}
                />

                <CustomerStat
                    title="Active"
                    value={
                        activeCustomers
                    }
                    subtitle="Active customers"
                    icon={UserCheck}
                />

                <CustomerStat
                    title="Inactive"
                    value={
                        inactiveCustomers
                    }
                    subtitle="Inactive customers"
                    icon={UserX}
                />

                <CustomerStat
                    title="Customer Sales"
                    value={formatCurrency(
                        totalSales
                    )}
                    subtitle="Sales linked to customers"
                    icon={
                        IndianRupeeIcon
                    }
                />

            </div>

            {/* FILTERS */}

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
                            onChange={(
                                e
                            ) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search name, phone or email..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white"
                        />

                    </div>

                    <select
                        value={
                            statusFilter
                        }
                        onChange={(
                            e
                        ) =>
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

            {/* CUSTOMER TABLE */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                    <h2 className="text-base font-bold text-slate-900">
                        Customer List
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Showing{" "}
                        {
                            filteredCustomers.length
                        }{" "}
                        of{" "}
                        {
                            customers.length
                        }{" "}
                        customers
                    </p>

                </div>

                {filteredCustomers.length ===
                0 ? (
                    <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                            <Users
                                size={28}
                                className="text-slate-400"
                            />

                        </div>

                        <h3 className="mt-4 text-base font-bold text-slate-800">
                            No customers found
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                            Add your first
                            customer to get
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
                            Add Customer
                        </button>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1200px]">

                            <thead>

                                <tr className="border-b border-slate-200 bg-slate-50">

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        CUSTOMER
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        CONTACT
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        LOCATION
                                    </th>

                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500">
                                        SALES
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        SALES VALUE
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

                                {filteredCustomers.map(
                                    (
                                        customer
                                    ) => {

                                        const salesCount =
                                            getCustomerSalesCount(
                                                customer.id
                                            );

                                        const salesTotal =
                                            getCustomerSalesTotal(
                                                customer.id
                                            );

                                        const status =
                                            String(
                                                customer.status ||
                                                    "ACTIVE"
                                            ).toUpperCase();

                                        return (
                                            <tr
                                                key={
                                                    customer.id
                                                }
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                            >

                                                {/* CUSTOMER */}

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-600">

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

                                                            <p className="text-sm font-bold text-slate-900">
                                                                {
                                                                    customer.name ||
                                                                    customer.customerName ||
                                                                    "Customer"
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-xs text-slate-400">
                                                                {customer.gstNumber
                                                                    ? `GST: ${customer.gstNumber}`
                                                                    : "Customer"}
                                                            </p>

                                                        </div>

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
                                                                customer.phone ||
                                                                customer.mobile ||
                                                                "—"
                                                            }

                                                        </div>

                                                        {customer.email && (
                                                            <div className="flex items-center gap-2 text-xs text-slate-400">

                                                                <Mail
                                                                    size={
                                                                        13
                                                                    }
                                                                />

                                                                {
                                                                    customer.email
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
                                                                customer.city,
                                                                customer.state,
                                                            ]
                                                                .filter(
                                                                    Boolean
                                                                )
                                                                .join(
                                                                    ", "
                                                                ) ||
                                                                customer.address ||
                                                                "—"}

                                                        </span>

                                                    </div>

                                                </td>

                                                {/* SALES */}

                                                <td className="px-6 py-5 text-center">

                                                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                                                        {
                                                            salesCount
                                                        }
                                                    </span>

                                                </td>

                                                {/* SALES VALUE */}

                                                <td className="px-6 py-5 text-right">

                                                    <span className="text-sm font-bold text-slate-900">
                                                        {formatCurrency(
                                                            salesTotal
                                                        )}
                                                    </span>

                                                </td>

                                                {/* STATUS */}

                                                <td className="px-6 py-5 text-center">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleStatus(
                                                                customer
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
                                                            href={`/user/customers/${customer.id}`}
                                                            title="View Customer"
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
                                                                    customer
                                                                )
                                                            }
                                                            title="Edit Customer"
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
                                                                deleteCustomer(
                                                                    customer
                                                                )
                                                            }
                                                            title="Delete Customer"
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

            {/* CUSTOMER MODAL */}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        {/* MODAL HEADER */}

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

                            <div>

                                <h2 className="text-lg font-bold text-slate-900">
                                    {editingCustomer
                                        ? "Edit Customer"
                                        : "Add Customer"}
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Enter customer
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
                                        label="Customer Name *"
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
                                        placeholder="Enter customer name"
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
                                        placeholder="customer@email.com"
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

                            {/* STATUS */}

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

                                    {editingCustomer
                                        ? "Update Customer"
                                        : "Save Customer"}

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

/*
 * =========================================
 * RUPEE ICON
 * =========================================
 */

function IndianRupeeIcon({
    size = 20,
}) {
    return (
        <span
            style={{
                fontSize: size,
                lineHeight: 1,
            }}
        >
            ₹
        </span>
    );
}