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
    Briefcase,
    CalendarDays,
    IndianRupee,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

const STAFF_KEY =
    STORAGE_KEYS.STAFF || "inventory_staff";

const generateId = () => {
    return `staff_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;
};

const generateEmployeeId = () => {
    return `EMP-${Date.now()
        .toString()
        .slice(-6)}`;
};

const emptyForm = {
    employeeId: "",
    name: "",
    phone: "",
    email: "",
    role: "",
    department: "",
    salary: "",
    joiningDate: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    emergencyContact: "",
    notes: "",
    status: "ACTIVE",
};

const defaultRoles = [
    "Manager",
    "Sales Executive",
    "Cashier",
    "Inventory Manager",
    "Store Keeper",
    "Accountant",
    "Delivery Executive",
    "Other",
];

const formatCurrency = (amount) => {
    return `₹${Number(
        amount || 0
    ).toLocaleString("en-IN")}`;
};

const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return String(date);
    }

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export default function StaffPage() {
    const [staff, setStaff] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [roleFilter, setRoleFilter] =
        useState("ALL");

    const [showModal, setShowModal] =
        useState(false);

    const [editingStaff, setEditingStaff] =
        useState(null);

    const [form, setForm] =
        useState(emptyForm);

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = () => {
        setLoading(true);

        const storedStaff =
            getStorage(STAFF_KEY, []);

        setStaff(
            Array.isArray(storedStaff)
                ? storedStaff
                : []
        );

        setLoading(false);
    };

    /*
     * ========================================
     * ROLES
     * ========================================
     */

    const roles = useMemo(() => {
        const storedRoles =
            staff
                .map(
                    (item) =>
                        item.role ||
                        item.designation
                )
                .filter(Boolean);

        return [
            ...new Set([
                ...defaultRoles,
                ...storedRoles,
            ]),
        ];
    }, [staff]);

    /*
     * ========================================
     * FILTER
     * ========================================
     */

    const filteredStaff = useMemo(() => {
        return staff.filter((item) => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            const name =
                item.name ||
                item.staffName ||
                "";

            const employeeId =
                item.employeeId ||
                "";

            const phone =
                item.phone ||
                item.mobile ||
                "";

            const email =
                item.email ||
                "";

            const role =
                item.role ||
                item.designation ||
                "";

            const matchesSearch =
                !query ||
                String(name)
                    .toLowerCase()
                    .includes(query) ||
                String(employeeId)
                    .toLowerCase()
                    .includes(query) ||
                String(phone)
                    .toLowerCase()
                    .includes(query) ||
                String(email)
                    .toLowerCase()
                    .includes(query) ||
                String(role)
                    .toLowerCase()
                    .includes(query);

            const status =
                String(
                    item.status ||
                        "ACTIVE"
                ).toUpperCase();

            const matchesStatus =
                statusFilter === "ALL" ||
                status === statusFilter;

            const itemRole =
                item.role ||
                item.designation ||
                "";

            const matchesRole =
                roleFilter === "ALL" ||
                itemRole === roleFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesRole
            );
        });
    }, [
        staff,
        search,
        statusFilter,
        roleFilter,
    ]);

    /*
     * ========================================
     * STATS
     * ========================================
     */

    const totalStaff = staff.length;

    const activeStaff = staff.filter(
        (item) =>
            String(
                item.status || "ACTIVE"
            ).toUpperCase() === "ACTIVE"
    ).length;

    const inactiveStaff =
        staff.filter(
            (item) =>
                String(
                    item.status || "ACTIVE"
                ).toUpperCase() ===
                "INACTIVE"
        ).length;

    const totalMonthlySalary =
        staff
            .filter(
                (item) =>
                    String(
                        item.status ||
                            "ACTIVE"
                    ).toUpperCase() ===
                    "ACTIVE"
            )
            .reduce(
                (total, item) =>
                    total +
                    Number(
                        item.salary || 0
                    ),
                0
            );

    /*
     * ========================================
     * FORM
     * ========================================
     */

    const handleChange = (
        field,
        value
    ) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    /*
     * ========================================
     * CREATE
     * ========================================
     */

    const openCreateModal = () => {
        setEditingStaff(null);

        setForm({
            ...emptyForm,
            employeeId:
                generateEmployeeId(),
        });

        setShowModal(true);
    };

    /*
     * ========================================
     * EDIT
     * ========================================
     */

    const openEditModal = (item) => {
        setEditingStaff(item);

        setForm({
            employeeId:
                item.employeeId ||
                "",
            name:
                item.name ||
                item.staffName ||
                "",
            phone:
                item.phone ||
                item.mobile ||
                "",
            email:
                item.email ||
                "",
            role:
                item.role ||
                item.designation ||
                "",
            department:
                item.department ||
                "",
            salary:
                item.salary ||
                "",
            joiningDate:
                item.joiningDate ||
                "",
            address:
                item.address ||
                "",
            city:
                item.city ||
                "",
            state:
                item.state ||
                "",
            pincode:
                item.pincode ||
                "",
            emergencyContact:
                item.emergencyContact ||
                "",
            notes:
                item.notes ||
                "",
            status:
                item.status ||
                "ACTIVE",
        });

        setShowModal(true);
    };

    /*
     * ========================================
     * SUBMIT
     * ========================================
     */

    const handleSubmit = (event) => {
        event.preventDefault();

        const name =
            form.name.trim();

        const phone =
            form.phone.trim();

        const email =
            form.email.trim();

        const role =
            form.role.trim();

        if (!name) {
            alert(
                "Staff name is required."
            );
            return;
        }

        if (!phone) {
            alert(
                "Phone number is required."
            );
            return;
        }

        if (!role) {
            alert(
                "Role / designation is required."
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
         * EDIT
         * ====================================
         */

        if (editingStaff) {
            const updatedStaff =
                staff.map((item) => {
                    if (
                        item.id !==
                        editingStaff.id
                    ) {
                        return item;
                    }

                    return {
                        ...item,

                        employeeId:
                            form.employeeId.trim() ||
                            item.employeeId,

                        name,

                        staffName: name,

                        phone,

                        mobile: phone,

                        email,

                        role,

                        designation: role,

                        department:
                            form.department.trim(),

                        salary: Number(
                            form.salary || 0
                        ),

                        joiningDate:
                            form.joiningDate,

                        address:
                            form.address.trim(),

                        city:
                            form.city.trim(),

                        state:
                            form.state.trim(),

                        pincode:
                            form.pincode.trim(),

                        emergencyContact:
                            form.emergencyContact.trim(),

                        notes:
                            form.notes.trim(),

                        status:
                            form.status,

                        updatedAt: now,
                    };
                });

            setStorage(
                STAFF_KEY,
                updatedStaff
            );

            setStaff(updatedStaff);

            alert(
                "Staff updated successfully."
            );
        }

        /*
         * ====================================
         * CREATE
         * ====================================
         */

        else {
            const employeeId =
                form.employeeId.trim() ||
                generateEmployeeId();

            const duplicateEmployee =
                staff.some(
                    (item) =>
                        String(
                            item.employeeId ||
                                ""
                        ).toLowerCase() ===
                        employeeId.toLowerCase()
                );

            if (duplicateEmployee) {
                alert(
                    "Employee ID already exists."
                );
                return;
            }

            const duplicatePhone =
                staff.some(
                    (item) =>
                        String(
                            item.phone ||
                                item.mobile ||
                                ""
                        ).trim() === phone
                );

            if (duplicatePhone) {
                alert(
                    "A staff member with this phone number already exists."
                );
                return;
            }

            const newStaff = {
                id: generateId(),

                employeeId,

                name,

                staffName: name,

                phone,

                mobile: phone,

                email,

                role,

                designation: role,

                department:
                    form.department.trim(),

                salary: Number(
                    form.salary || 0
                ),

                joiningDate:
                    form.joiningDate,

                address:
                    form.address.trim(),

                city:
                    form.city.trim(),

                state:
                    form.state.trim(),

                pincode:
                    form.pincode.trim(),

                emergencyContact:
                    form.emergencyContact.trim(),

                notes:
                    form.notes.trim(),

                status:
                    form.status,

                createdAt: now,

                updatedAt: now,
            };

            const updatedStaff = [
                newStaff,
                ...staff,
            ];

            setStorage(
                STAFF_KEY,
                updatedStaff
            );

            setStaff(updatedStaff);

            alert(
                "Staff created successfully."
            );
        }

        setShowModal(false);

        setEditingStaff(null);

        setForm({
            ...emptyForm,
        });
    };

    /*
     * ========================================
     * TOGGLE STATUS
     * ========================================
     */

    const toggleStatus = (item) => {
        const currentStatus =
            String(
                item.status || "ACTIVE"
            ).toUpperCase();

        const newStatus =
            currentStatus === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const updatedStaff =
            staff.map((staffItem) =>
                staffItem.id === item.id
                    ? {
                          ...staffItem,
                          status:
                              newStatus,
                          updatedAt:
                              new Date().toISOString(),
                      }
                    : staffItem
            );

        setStorage(
            STAFF_KEY,
            updatedStaff
        );

        setStaff(updatedStaff);
    };

    /*
     * ========================================
     * DELETE
     * ========================================
     */

    const deleteStaff = (item) => {
        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${item.name}"?`
            );

        if (!confirmed) return;

        const updatedStaff =
            staff.filter(
                (staffItem) =>
                    staffItem.id !== item.id
            );

        setStorage(
            STAFF_KEY,
            updatedStaff
        );

        setStaff(updatedStaff);

        alert(
            "Staff deleted successfully."
        );
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
                        Loading staff...
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
                            Staff
                        </h1>

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage employees and
                        staff information.
                    </p>
                </div>

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={loadStaff}
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
                        Add Staff
                    </button>

                </div>

            </div>

            {/* STATS */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StaffStat
                    title="Total Staff"
                    value={totalStaff}
                    subtitle="All employees"
                    icon={Users}
                />

                <StaffStat
                    title="Active Staff"
                    value={activeStaff}
                    subtitle="Currently active"
                    icon={UserCheck}
                />

                <StaffStat
                    title="Inactive Staff"
                    value={inactiveStaff}
                    subtitle="Currently inactive"
                    icon={UserX}
                />

                <StaffStat
                    title="Monthly Salary"
                    value={formatCurrency(
                        totalMonthlySalary
                    )}
                    subtitle="Active staff salary"
                    icon={IndianRupee}
                />

            </div>

            {/* FILTER */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">

                    <div className="relative">

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
                            placeholder="Search name, employee ID, phone, email..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white"
                        />

                    </div>

                    <select
                        value={
                            roleFilter
                        }
                        onChange={(e) =>
                            setRoleFilter(
                                e.target.value
                            )
                        }
                        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                    >
                        <option value="ALL">
                            All Roles
                        </option>

                        {roles.map(
                            (role) => (
                                <option
                                    key={
                                        role
                                    }
                                    value={
                                        role
                                    }
                                >
                                    {role}
                                </option>
                            )
                        )}
                    </select>

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
                        Staff List
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        Showing{" "}
                        {
                            filteredStaff.length
                        }{" "}
                        of{" "}
                        {staff.length}{" "}
                        staff members
                    </p>

                </div>

                {filteredStaff.length ===
                0 ? (
                    <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                            <Users
                                size={28}
                                className="text-slate-400"
                            />

                        </div>

                        <h3 className="mt-4 text-base font-bold text-slate-800">
                            No staff found
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                            Add your first
                            staff member.
                        </p>

                        <button
                            type="button"
                            onClick={
                                openCreateModal
                            }
                            className="mt-5 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            <Plus size={16} />
                            Add Staff
                        </button>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1200px]">

                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        STAFF
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        ROLE
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        CONTACT
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        JOINING
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        SALARY
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

                                {filteredStaff.map(
                                    (item) => {
                                        const status =
                                            String(
                                                item.status ||
                                                    "ACTIVE"
                                            ).toUpperCase();

                                        return (
                                            <tr
                                                key={
                                                    item.id
                                                }
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                            >

                                                {/* STAFF */}

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-600">
                                                            {(
                                                                item.name ||
                                                                item.staffName ||
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
                                                                    item.name ||
                                                                    item.staffName ||
                                                                    "Staff"
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-xs font-medium text-slate-400">
                                                                {item.employeeId ||
                                                                    "No Employee ID"}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* ROLE */}

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-2">

                                                        <Briefcase
                                                            size={
                                                                16
                                                            }
                                                            className="text-slate-400"
                                                        />

                                                        <div>

                                                            <p className="text-sm font-semibold text-slate-700">
                                                                {
                                                                    item.role ||
                                                                    item.designation ||
                                                                    "—"
                                                                }
                                                            </p>

                                                            {item.department && (
                                                                <p className="mt-0.5 text-xs text-slate-400">
                                                                    {
                                                                        item.department
                                                                    }
                                                                </p>
                                                            )}

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
                                                                item.phone ||
                                                                item.mobile ||
                                                                "—"
                                                            }

                                                        </div>

                                                        {item.email && (
                                                            <div className="flex items-center gap-2 text-xs text-slate-400">

                                                                <Mail
                                                                    size={
                                                                        13
                                                                    }
                                                                />

                                                                {
                                                                    item.email
                                                                }

                                                            </div>
                                                        )}

                                                    </div>

                                                </td>

                                                {/* JOINING */}

                                                <td className="px-6 py-5">

                                                    <div className="flex items-center gap-2 text-sm text-slate-600">

                                                        <CalendarDays
                                                            size={
                                                                15
                                                            }
                                                            className="text-slate-400"
                                                        />

                                                        {formatDate(
                                                            item.joiningDate
                                                        )}

                                                    </div>

                                                </td>

                                                {/* SALARY */}

                                                <td className="px-6 py-5 text-right">

                                                    <span className="text-sm font-bold text-slate-900">
                                                        {formatCurrency(
                                                            item.salary
                                                        )}
                                                    </span>

                                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                                        / month
                                                    </p>

                                                </td>

                                                {/* STATUS */}

                                                <td className="px-6 py-5 text-center">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleStatus(
                                                                item
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
                                                            href={`/user/staff/${item.id}`}
                                                            title="View Staff"
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
                                                                    item
                                                                )
                                                            }
                                                            title="Edit Staff"
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
                                                                deleteStaff(
                                                                    item
                                                                )
                                                            }
                                                            title="Delete Staff"
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
                                    {editingStaff
                                        ? "Edit Staff"
                                        : "Add Staff"}
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Enter employee
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
                                        label="Employee ID"
                                        value={
                                            form.employeeId
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            handleChange(
                                                "employeeId",
                                                value
                                            )
                                        }
                                        placeholder="EMP-000001"
                                    />

                                    <FormField
                                        label="Full Name *"
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
                                        placeholder="Enter employee name"
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
                                        placeholder="employee@email.com"
                                    />

                                </div>

                            </div>

                            {/* JOB */}

                            <div>

                                <h3 className="mb-4 text-sm font-bold text-slate-900">
                                    Job Information
                                </h3>

                                <div className="grid gap-4 md:grid-cols-2">

                                    <div>

                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Role / Designation *
                                        </label>

                                        <input
                                            type="text"
                                            list="staff-roles"
                                            value={
                                                form.role
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                handleChange(
                                                    "role",
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="e.g. Manager"
                                            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                                        />

                                        <datalist id="staff-roles">

                                            {roles.map(
                                                (
                                                    role
                                                ) => (
                                                    <option
                                                        key={
                                                            role
                                                        }
                                                        value={
                                                            role
                                                        }
                                                    />
                                                )
                                            )}

                                        </datalist>

                                    </div>

                                    <FormField
                                        label="Department"
                                        value={
                                            form.department
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            handleChange(
                                                "department",
                                                value
                                            )
                                        }
                                        placeholder="e.g. Sales"
                                    />

                                    <FormField
                                        label="Monthly Salary"
                                        type="number"
                                        value={
                                            form.salary
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            handleChange(
                                                "salary",
                                                value
                                            )
                                        }
                                        placeholder="25000"
                                    />

                                    <FormField
                                        label="Joining Date"
                                        type="date"
                                        value={
                                            form.joiningDate
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            handleChange(
                                                "joiningDate",
                                                value
                                            )
                                        }
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
                                            rows={3}
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
                                        label="Emergency Contact"
                                        value={
                                            form.emergencyContact
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            handleChange(
                                                "emergencyContact",
                                                value
                                            )
                                        }
                                        placeholder="Emergency phone"
                                    />

                                </div>

                            </div>

                            {/* STATUS + NOTES */}

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
                                        size={17}
                                    />

                                    {editingStaff
                                        ? "Update Staff"
                                        : "Save Staff"}

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

function StaffStat({
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