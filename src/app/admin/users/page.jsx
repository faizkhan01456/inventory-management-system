"use client";

import { useEffect, useState } from "react";

import {
    Plus,
    Search,
    Users,
    RefreshCw,
} from "lucide-react";

import UserTable from "@/components/admin/UserTable";
import UserForm from "@/components/admin/UserForm";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

import { demoUsers } from "@/data/demoData";

export default function UsersPage() {
    const [users, setUsers] = useState([]);

    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [editingUser, setEditingUser] = useState(null);

    /*
     * =========================================
     * LOAD USERS
     * =========================================
     */

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        const storedUsers = getStorage(
            STORAGE_KEYS.USERS,
            demoUsers
        );

        if (Array.isArray(storedUsers)) {
            setUsers(storedUsers);
        } else {
            setUsers(demoUsers);
        }
    };

    /*
     * =========================================
     * SAVE USERS
     * =========================================
     */

    const saveUsers = (updatedUsers) => {
        setUsers(updatedUsers);

        setStorage(
            STORAGE_KEYS.USERS,
            updatedUsers
        );
    };

    /*
     * =========================================
     * CREATE USER
     * =========================================
     */

    const handleCreate = (form) => {
        const username =
            form.username.trim();

        /*
         * Duplicate username check
         */

        const exists = users.some(
            (user) =>
                user.username
                    ?.trim()
                    .toLowerCase() ===
                username.toLowerCase()
        );

        if (exists) {
            alert(
                "Username already exists."
            );

            return;
        }

        /*
         * Plan validation
         */

        if (!form.plan) {
            alert(
                "Please select a subscription plan."
            );

            return;
        }

        /*
         * =====================================
         * GET PLANS
         * =====================================
         */

        const existingPlans =
            getStorage(
                STORAGE_KEYS.PLANS,
                []
            );

        const availablePlans =
            Array.isArray(
                existingPlans
            )
                ? existingPlans
                : [];

        /*
         * Find selected plan
         */

        const selectedPlan =
            availablePlans.find(
                (plan) =>
                    plan.name
                        ?.trim()
                        .toLowerCase() ===
                    form.plan
                        .trim()
                        .toLowerCase()
            );

        /*
         * Selected plan not found
         */

        if (!selectedPlan) {
            alert(
                `Selected plan "${form.plan}" was not found. Please check Plans Management.`
            );

            return;
        }

        /*
         * =====================================
         * GENERATE IDs
         * =====================================
         */

        const timestamp =
            Date.now();

        const userId =
            `user_${timestamp}`;

        const businessId =
            `business_${timestamp}`;

        const subscriptionId =
            `subscription_${timestamp}`;

        const createdAt =
            new Date()
                .toISOString()
                .split("T")[0];

        /*
         * =====================================
         * CREATE USER
         * =====================================
         */

        const newUser = {
            id: userId,

            name:
                form.name.trim(),

            username,

            password:
                form.password,

            businessName:
                form.businessName.trim(),

            email:
                form.email?.trim() ||
                "",

            phone:
                form.phone?.trim() ||
                "",

            /*
             * Selected plan
             */

            plan:
                selectedPlan.name,

            role: "USER",

            status: "ACTIVE",

            /*
             * Business relation
             */

            businessId,

            createdAt,
        };

        /*
         * =====================================
         * CREATE BUSINESS
         * =====================================
         */

        const newBusiness = {
            id: businessId,

            name:
                form.businessName.trim(),

            ownerId: userId,

            ownerName:
                form.name.trim(),

            email:
                form.email?.trim() ||
                "",

            phone:
                form.phone?.trim() ||
                "",

            /*
             * Plan information
             */

            plan:
                selectedPlan.name,

            planId:
                selectedPlan.id,

            status: "ACTIVE",

            createdAt,
        };

        /*
         * =====================================
         * CREATE SUBSCRIPTION
         * =====================================
         */

        const startDate =
            new Date();

        const endDate =
            new Date(
                startDate
            );

        /*
         * YEARLY
         */

        if (
            selectedPlan.billingCycle ===
            "YEARLY"
        ) {
            endDate.setFullYear(
                endDate.getFullYear() +
                    1
            );

            endDate.setDate(
                endDate.getDate() -
                    1
            );
        }

        /*
         * MONTHLY
         */

        else {
            endDate.setMonth(
                endDate.getMonth() +
                    1
            );

            endDate.setDate(
                endDate.getDate() -
                    1
            );
        }

        const subscriptionStartDate =
            startDate
                .toISOString()
                .split("T")[0];

        const subscriptionEndDate =
            endDate
                .toISOString()
                .split("T")[0];

        const newSubscription = {
            id: subscriptionId,

            /*
             * Relations
             */

            userId,

            businessId,

            ownerId: userId,

            /*
             * Business
             */

            businessName:
                form.businessName.trim(),

            ownerName:
                form.name.trim(),

            /*
             * Plan
             */

            planId:
                selectedPlan.id,

            planName:
                selectedPlan.name,

            /*
             * Price
             */

            amount:
                Number(
                    selectedPlan.price ||
                        0
                ),

            /*
             * Billing
             */

            billingCycle:
                selectedPlan.billingCycle ||
                "MONTHLY",

            /*
             * Dates
             */

            startDate:
                subscriptionStartDate,

            endDate:
                subscriptionEndDate,

            /*
             * Status
             */

            status: "ACTIVE",

            createdAt,
        };

        /*
         * =====================================
         * SAVE USER
         * =====================================
         */

        const updatedUsers = [
            ...users,
            newUser,
        ];

        saveUsers(
            updatedUsers
        );

        /*
         * =====================================
         * SAVE BUSINESS
         * =====================================
         */

        const existingBusinesses =
            getStorage(
                STORAGE_KEYS.BUSINESSES,
                []
            );

        const businesses =
            Array.isArray(
                existingBusinesses
            )
                ? existingBusinesses
                : [];

        const updatedBusinesses = [
            ...businesses,
            newBusiness,
        ];

        setStorage(
            STORAGE_KEYS.BUSINESSES,
            updatedBusinesses
        );

        /*
         * =====================================
         * SAVE SUBSCRIPTION
         * =====================================
         */

        const existingSubscriptions =
            getStorage(
                STORAGE_KEYS.SUBSCRIPTIONS,
                []
            );

        const subscriptions =
            Array.isArray(
                existingSubscriptions
            )
                ? existingSubscriptions
                : [];

        const updatedSubscriptions = [
            ...subscriptions,
            newSubscription,
        ];

        setStorage(
            STORAGE_KEYS.SUBSCRIPTIONS,
            updatedSubscriptions
        );

        /*
         * =====================================
         * CLOSE MODAL
         * =====================================
         */

        setShowForm(false);

        setEditingUser(null);

        /*
         * =====================================
         * SUCCESS MESSAGE
         * =====================================
         */

        alert(
            `User, Business & Subscription created successfully!\n\n` +
            `Username: ${newUser.username}\n` +
            `Password: ${newUser.password}\n\n` +
            `Business: ${newBusiness.name}\n` +
            `Plan: ${newSubscription.planName}\n` +
            `Amount: ₹${newSubscription.amount}\n` +
            `Subscription: ${newSubscription.startDate} → ${newSubscription.endDate}`
        );
    };

    /*
     * =========================================
     * UPDATE USER
     * =========================================
     */

    const handleUpdate = (form) => {
        if (!editingUser) {
            return;
        }

        const username =
            form.username.trim();

        /*
         * Duplicate username check
         */

        const usernameExists =
            users.some(
                (user) =>
                    user.id !==
                        editingUser.id &&
                    user.username
                        ?.trim()
                        .toLowerCase() ===
                        username.toLowerCase()
            );

        if (usernameExists) {
            alert(
                "Username already exists."
            );

            return;
        }

        /*
         * =====================================
         * UPDATE USER
         * =====================================
         */

        const updatedUsers =
            users.map(
                (user) => {
                    if (
                        user.id !==
                        editingUser.id
                    ) {
                        return user;
                    }

                    return {
                        ...user,

                        name:
                            form.name.trim(),

                        username,

                        /*
                         * Password blank hai to
                         * old password rakho.
                         */

                        password:
                            form.password ||
                            user.password,

                        businessName:
                            form.businessName.trim(),

                        email:
                            form.email?.trim() ||
                            "",

                        phone:
                            form.phone?.trim() ||
                            "",

                        plan:
                            form.plan ||
                            user.plan ||
                            "BASIC",
                    };
                }
            );

        /*
         * SAVE USER
         */

        saveUsers(
            updatedUsers
        );

        /*
         * =====================================
         * UPDATE BUSINESS
         * =====================================
         */

        const existingBusinesses =
            getStorage(
                STORAGE_KEYS.BUSINESSES,
                []
            );

        if (
            Array.isArray(
                existingBusinesses
            )
        ) {
            const updatedBusinesses =
                existingBusinesses.map(
                    (business) => {
                        const isOwner =
                            business.ownerId ===
                                editingUser.id ||
                            business.id ===
                                editingUser.businessId;

                        if (!isOwner) {
                            return business;
                        }

                        return {
                            ...business,

                            name:
                                form.businessName.trim(),

                            ownerName:
                                form.name.trim(),

                            email:
                                form.email?.trim() ||
                                "",

                            phone:
                                form.phone?.trim() ||
                                "",

                            plan:
                                form.plan ||
                                business.plan ||
                                "BASIC",
                        };
                    }
                );

            setStorage(
                STORAGE_KEYS.BUSINESSES,
                updatedBusinesses
            );
        }

        /*
         * =====================================
         * UPDATE SUBSCRIPTION PLAN
         * =====================================
         */

        if (
            form.plan &&
            form.plan !==
                editingUser.plan
        ) {
            const existingPlans =
                getStorage(
                    STORAGE_KEYS.PLANS,
                    []
                );

            const selectedPlan =
                Array.isArray(
                    existingPlans
                )
                    ? existingPlans.find(
                          (plan) =>
                              plan.name
                                  ?.trim()
                                  .toLowerCase() ===
                              form.plan
                                  .trim()
                                  .toLowerCase()
                      )
                    : null;

            if (selectedPlan) {
                const existingSubscriptions =
                    getStorage(
                        STORAGE_KEYS.SUBSCRIPTIONS,
                        []
                    );

                if (
                    Array.isArray(
                        existingSubscriptions
                    )
                ) {
                    const updatedSubscriptions =
                        existingSubscriptions.map(
                            (
                                subscription
                            ) => {
                                const belongsToUser =
                                    subscription.userId ===
                                    editingUser.id;

                                const belongsToBusiness =
                                    subscription.businessId ===
                                    editingUser.businessId;

                                if (
                                    !belongsToUser &&
                                    !belongsToBusiness
                                ) {
                                    return subscription;
                                }

                                return {
                                    ...subscription,

                                    planId:
                                        selectedPlan.id,

                                    planName:
                                        selectedPlan.name,

                                    amount:
                                        Number(
                                            selectedPlan.price ||
                                                0
                                        ),

                                    billingCycle:
                                        selectedPlan.billingCycle ||
                                        "MONTHLY",
                                };
                            }
                        );

                    setStorage(
                        STORAGE_KEYS.SUBSCRIPTIONS,
                        updatedSubscriptions
                    );
                }
            }
        }

        /*
         * =====================================
         * CLOSE
         * =====================================
         */

        setShowForm(false);

        setEditingUser(null);

        alert(
            "User, Business & Subscription updated successfully."
        );
    };

    /*
     * =========================================
     * ACTIVATE / DEACTIVATE USER
     * =========================================
     */

    const handleToggleStatus = (
        id
    ) => {
        const user = users.find(
            (item) =>
                item.id === id
        );

        if (!user) {
            return;
        }

        const newStatus =
            user.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        const updatedUsers =
            users.map(
                (item) => {
                    if (
                        item.id !== id
                    ) {
                        return item;
                    }

                    return {
                        ...item,
                        status:
                            newStatus,
                    };
                }
            );

        saveUsers(
            updatedUsers
        );
    };

    /*
     * =========================================
     * DELETE USER
     * =========================================
     */

    const handleDelete = (
        id
    ) => {
        const user = users.find(
            (item) =>
                item.id === id
        );

        if (!user) {
            return;
        }

        const confirmed =
            window.confirm(
                `Delete ${user.name}?\n\nThis will also delete the related business and subscription.\n\nThis action cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        /*
         * DELETE USER
         */

        const updatedUsers =
            users.filter(
                (item) =>
                    item.id !== id
            );

        saveUsers(
            updatedUsers
        );

        /*
         * DELETE BUSINESS
         */

        const existingBusinesses =
            getStorage(
                STORAGE_KEYS.BUSINESSES,
                []
            );

        if (
            Array.isArray(
                existingBusinesses
            )
        ) {
            const updatedBusinesses =
                existingBusinesses.filter(
                    (business) =>
                        business.ownerId !==
                            id &&
                        business.id !==
                            user.businessId
                );

            setStorage(
                STORAGE_KEYS.BUSINESSES,
                updatedBusinesses
            );
        }

        /*
         * DELETE SUBSCRIPTION
         */

        const existingSubscriptions =
            getStorage(
                STORAGE_KEYS.SUBSCRIPTIONS,
                []
            );

        if (
            Array.isArray(
                existingSubscriptions
            )
        ) {
            const updatedSubscriptions =
                existingSubscriptions.filter(
                    (
                        subscription
                    ) =>
                        subscription.userId !==
                            id &&
                        subscription.businessId !==
                            user.businessId
                );

            setStorage(
                STORAGE_KEYS.SUBSCRIPTIONS,
                updatedSubscriptions
            );
        }

        /*
         * CLOSE MODAL
         */

        if (
            editingUser?.id === id
        ) {
            setEditingUser(null);
            setShowForm(false);
        }

        alert(
            "User, Business & Subscription deleted successfully."
        );
    };

    /*
     * =========================================
     * SEARCH
     * =========================================
     */

    const filteredUsers =
        users.filter(
            (user) => {
                const value =
                    search
                        .toLowerCase()
                        .trim();

                if (!value) {
                    return true;
                }

                return (
                    user.name
                        ?.toLowerCase()
                        .includes(value) ||

                    user.username
                        ?.toLowerCase()
                        .includes(value) ||

                    user.businessName
                        ?.toLowerCase()
                        .includes(value) ||

                    user.email
                        ?.toLowerCase()
                        .includes(value) ||

                    user.phone
                        ?.toLowerCase()
                        .includes(value)
                );
            }
        );

    /*
     * =========================================
     * STATS
     * =========================================
     */

    const activeCount =
        users.filter(
            (user) =>
                user.status ===
                "ACTIVE"
        ).length;

    const inactiveCount =
        users.length -
        activeCount;

    /*
     * =========================================
     * OPEN CREATE MODAL
     * =========================================
     */

    const openCreateModal = () => {
        setEditingUser(null);

        setShowForm(true);
    };

    /*
     * =========================================
     * OPEN EDIT MODAL
     * =========================================
     */

    const openEditModal = (
        user
    ) => {
        setEditingUser(user);

        setShowForm(true);
    };

    /*
     * =========================================
     * CLOSE MODAL
     * =========================================
     */

    const closeModal = () => {
        setShowForm(false);

        setEditingUser(null);
    };

    /*
     * =========================================
     * REFRESH
     * =========================================
     */

    const handleRefresh = () => {
        const storedUsers =
            getStorage(
                STORAGE_KEYS.USERS,
                demoUsers
            );

        setUsers(
            Array.isArray(
                storedUsers
            )
                ? storedUsers
                : demoUsers
        );
    };

    /*
     * =========================================
     * UI
     * =========================================
     */

    return (
        <div className="space-y-6">

            {/* ===================================
                HEADER
            ==================================== */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>

                    <div className="flex items-center gap-2">

                        <Users
                            size={23}
                            className="text-slate-700"
                        />

                        <h1 className="text-2xl font-bold text-slate-900">
                            Users
                        </h1>

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Create and manage
                        business user
                        accounts.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={
                        openCreateModal
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >

                    <Plus
                        size={18}
                    />

                    Add User

                </button>

            </div>

            {/* ===================================
                STATS
            ==================================== */}

            <div className="grid gap-4 sm:grid-cols-3">

                <MiniStat
                    label="Total Users"
                    value={
                        users.length
                    }
                />

                <MiniStat
                    label="Active Users"
                    value={
                        activeCount
                    }
                />

                <MiniStat
                    label="Inactive Users"
                    value={
                        inactiveCount
                    }
                />

            </div>

            {/* ===================================
                USERS TABLE
            ==================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* TABLE HEADER */}

                <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">

                    <div>

                        <h2 className="text-base font-bold text-slate-900">
                            Business Users
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            {
                                filteredUsers.length
                            }{" "}
                            users found
                        </p>

                    </div>

                    <div className="flex gap-2">

                        {/* SEARCH */}

                        <div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 md:w-72">

                            <Search
                                size={17}
                                className="shrink-0 text-slate-400"
                            />

                            <input
                                type="text"
                                value={
                                    search
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Search users..."
                                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                            />

                        </div>

                        {/* REFRESH */}

                        <button
                            type="button"
                            onClick={
                                handleRefresh
                            }
                            title="Refresh"
                            className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                        >

                            <RefreshCw
                                size={18}
                            />

                        </button>

                    </div>

                </div>

                {/* TABLE */}

                <UserTable
                    users={
                        filteredUsers
                    }
                    onToggleStatus={
                        handleToggleStatus
                    }
                    onDelete={
                        handleDelete
                    }
                    onEdit={
                        openEditModal
                    }
                />

            </div>

            {/* ===================================
                CREATE / EDIT MODAL
            ==================================== */}

            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">

                    <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl md:p-7">

                        <UserForm
                            initialData={
                                editingUser
                            }
                            onSubmit={
                                editingUser
                                    ? handleUpdate
                                    : handleCreate
                            }
                            onCancel={
                                closeModal
                            }
                        />

                    </div>

                </div>
            )}

        </div>
    );
}

/* ===================================
   MINI STAT
==================================== */

function MiniStat({
    label,
    value,
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <p className="text-xs font-medium text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
                {value}
            </p>

        </div>
    );
}