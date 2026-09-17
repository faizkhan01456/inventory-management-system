"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Users,
    Phone,
    Mail,
    MapPin,
    Briefcase,
    CalendarDays,
    IndianRupee,
    UserCheck,
    UserX,
    FileText,
    Clock,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

const STAFF_KEY =
    STORAGE_KEYS.STAFF || "inventory_staff";

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

export default function StaffDetailsPage({
    params,
}) {
    const [staff, setStaff] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        const loadStaff = async () => {
            const resolvedParams =
                await params;

            const storedStaff =
                getStorage(
                    STAFF_KEY,
                    []
                );

            const found =
                Array.isArray(
                    storedStaff
                )
                    ? storedStaff.find(
                          (item) =>
                              String(
                                  item.id
                              ) ===
                              String(
                                  resolvedParams.id
                              )
                      )
                    : null;

            setStaff(
                found || null
            );

            setLoading(false);
        };

        loadStaff();
    }, [params]);

    /*
     * ========================================
     * TOGGLE STATUS
     * ========================================
     */

    const toggleStatus = () => {
        if (!staff) return;

        const storedStaff =
            getStorage(
                STAFF_KEY,
                []
            );

        const currentStatus =
            String(
                staff.status || "ACTIVE"
            ).toUpperCase();

        const newStatus =
            currentStatus === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const updatedStaff =
            Array.isArray(
                storedStaff
            )
                ? storedStaff.map(
                      (item) =>
                          item.id ===
                          staff.id
                              ? {
                                    ...item,
                                    status:
                                        newStatus,
                                    updatedAt:
                                        new Date().toISOString(),
                                }
                              : item
                  )
                : [];

        setStorage(
            STAFF_KEY,
            updatedStaff
        );

        setStaff((previous) => ({
            ...previous,
            status: newStatus,
        }));
    };

    /*
     * ========================================
     * EXPERIENCE
     * ========================================
     */

    const experience = useMemo(() => {
        if (!staff?.joiningDate) {
            return "—";
        }

        const joiningDate =
            new Date(
                staff.joiningDate
            );

        if (
            Number.isNaN(
                joiningDate.getTime()
            )
        ) {
            return "—";
        }

        const today = new Date();

        let years =
            today.getFullYear() -
            joiningDate.getFullYear();

        let months =
            today.getMonth() -
            joiningDate.getMonth();

        if (
            today.getDate() <
            joiningDate.getDate()
        ) {
            months--;
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        if (years < 0) {
            return "Not started";
        }

        if (years === 0) {
            return `${months} month${
                months === 1
                    ? ""
                    : "s"
            }`;
        }

        return `${years} year${
            years === 1 ? "" : "s"
        } ${
            months
        } month${
            months === 1
                ? ""
                : "s"
        }`;
    }, [staff]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />

                    <p className="mt-3 text-sm text-slate-500">
                        Loading staff...
                    </p>

                </div>

            </div>
        );
    }

    if (!staff) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                        <Users
                            size={28}
                            className="text-slate-400"
                        />

                    </div>

                    <h2 className="mt-4 text-xl font-bold text-slate-900">
                        Staff Not Found
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        The staff member
                        you're looking for
                        does not exist.
                    </p>

                    <Link
                        href="/user/staff"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        <ArrowLeft
                            size={17}
                        />
                        Back to Staff
                    </Link>

                </div>

            </div>
        );
    }

    const status =
        String(
            staff.status || "ACTIVE"
        ).toUpperCase();

    const staffName =
        staff.name ||
        staff.staffName ||
        "Staff";

    const role =
        staff.role ||
        staff.designation ||
        "—";

    return (
        <div className="space-y-6">

            {/* HEADER */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div className="flex items-center gap-3">

                    <Link
                        href="/user/staff"
                        className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <div>

                        <div className="flex items-center gap-2">

                            <Users
                                size={24}
                                className="text-slate-700"
                            />

                            <h1 className="text-2xl font-bold text-slate-900">
                                Staff Details
                            </h1>

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            {staffName}
                        </p>

                    </div>

                </div>

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={
                            toggleStatus
                        }
                        className={
                            status ===
                            "ACTIVE"
                                ? "flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"
                                : "flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600 hover:bg-emerald-100"
                        }
                    >

                        {status ===
                        "ACTIVE" ? (
                            <>
                                <UserX
                                    size={17}
                                />
                                Deactivate
                            </>
                        ) : (
                            <>
                                <UserCheck
                                    size={17}
                                />
                                Activate
                            </>
                        )}

                    </button>

                    <Link
                        href="/user/staff"
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        <Users size={17} />
                        All Staff
                    </Link>

                </div>

            </div>

            {/* PROFILE */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 p-6">

                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                        <div className="flex items-center gap-4">

                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-600">

                                {staffName
                                    .charAt(
                                        0
                                    )
                                    .toUpperCase()}

                            </div>

                            <div>

                                <h2 className="text-xl font-bold text-slate-900">
                                    {staffName}
                                </h2>

                                <div className="mt-2 flex flex-wrap items-center gap-3">

                                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                                        {staff.employeeId ||
                                            "No Employee ID"}
                                    </span>

                                    <span
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

                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                {/* CONTACT DETAILS */}

                <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-4">

                    <DetailItem
                        icon={Phone}
                        label="Phone"
                        value={
                            staff.phone ||
                            staff.mobile ||
                            "—"
                        }
                    />

                    <DetailItem
                        icon={Mail}
                        label="Email"
                        value={
                            staff.email ||
                            "—"
                        }
                    />

                    <DetailItem
                        icon={Briefcase}
                        label="Role"
                        value={role}
                    />

                    <DetailItem
                        icon={CalendarDays}
                        label="Joining Date"
                        value={formatDate(
                            staff.joiningDate
                        )}
                    />

                </div>

            </div>

            {/* JOB STATS */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StaffStat
                    title="Monthly Salary"
                    value={formatCurrency(
                        staff.salary
                    )}
                    subtitle="Current salary"
                    icon={
                        IndianRupee
                    }
                />

                <StaffStat
                    title="Department"
                    value={
                        staff.department ||
                        "—"
                    }
                    subtitle="Assigned department"
                    icon={
                        Briefcase
                    }
                />

                <StaffStat
                    title="Experience"
                    value={experience}
                    subtitle="Since joining"
                    icon={Clock}
                />

                <StaffStat
                    title="Status"
                    value={status}
                    subtitle="Current status"
                    icon={
                        status ===
                        "ACTIVE"
                            ? UserCheck
                            : UserX
                    }
                />

            </div>

            {/* PERSONAL INFORMATION */}

            <div className="grid gap-6 lg:grid-cols-2">

                {/* ADDRESS */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-2">

                        <MapPin
                            size={20}
                            className="text-slate-600"
                        />

                        <h2 className="font-bold text-slate-900">
                            Address
                        </h2>

                    </div>

                    <div className="mt-5 rounded-xl bg-slate-50 p-4">

                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">

                            {[
                                staff.address,
                                staff.city,
                                staff.state,
                                staff.pincode,
                            ]
                                .filter(
                                    Boolean
                                )
                                .join(
                                    "\n"
                                ) ||
                                "No address added."}

                        </p>

                    </div>

                </div>

                {/* EMERGENCY */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-2">

                        <Phone
                            size={20}
                            className="text-slate-600"
                        />

                        <h2 className="font-bold text-slate-900">
                            Emergency Contact
                        </h2>

                    </div>

                    <div className="mt-5 rounded-xl bg-slate-50 p-4">

                        <p className="text-sm font-semibold text-slate-700">
                            {staff.emergencyContact ||
                                "No emergency contact added."}
                        </p>

                    </div>

                </div>

            </div>

            {/* NOTES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center gap-2">

                    <FileText
                        size={20}
                        className="text-slate-600"
                    />

                    <h2 className="font-bold text-slate-900">
                        Notes
                    </h2>

                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">

                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {staff.notes ||
                            "No notes added."}
                    </p>

                </div>

            </div>

            {/* STAFF INFORMATION */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h2 className="font-bold text-slate-900">
                    Staff Information
                </h2>

                <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                    <DetailItem
                        icon={
                            CalendarDays
                        }
                        label="Created"
                        value={formatDate(
                            staff.createdAt
                        )}
                    />

                    <DetailItem
                        icon={
                            CalendarDays
                        }
                        label="Last Updated"
                        value={formatDate(
                            staff.updatedAt
                        )}
                    />

                    <DetailItem
                        icon={Briefcase}
                        label="Designation"
                        value={role}
                    />

                </div>

            </div>

        </div>
    );
}

/*
 * =========================================
 * DETAIL ITEM
 * =========================================
 */

function DetailItem({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div>

            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">

                <Icon size={14} />

                {label}

            </div>

            <p className="mt-2 break-words text-sm font-semibold text-slate-700">
                {value}
            </p>

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

                    <p className="mt-2 text-xl font-bold text-slate-900">
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