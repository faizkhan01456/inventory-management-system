"use client";

import { useEffect, useMemo, useState } from "react";

import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    RefreshCw,
    Search,
    Filter,
    Users,
    CreditCard,
    Building2,
    AlertTriangle,
    Info,
    XCircle,
    Clock,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

import { notifications as demoNotifications } from "@/data/demoData";

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [filter, setFilter] =
        useState("ALL");

    const [loading, setLoading] =
        useState(true);

    /*
     * =========================================
     * LOAD NOTIFICATIONS
     * =========================================
     */

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = () => {
        setLoading(true);

        const stored =
            getStorage(
                STORAGE_KEYS.NOTIFICATIONS,
                null
            );

        if (
            Array.isArray(stored)
        ) {
            setNotifications(stored);
        } else {
            setStorage(
                STORAGE_KEYS.NOTIFICATIONS,
                demoNotifications
            );

            setNotifications(
                demoNotifications
            );
        }

        setLoading(false);
    };

    /*
     * =========================================
     * FILTER
     * =========================================
     */

    const filteredNotifications =
        useMemo(() => {
            return notifications.filter(
                (notification) => {
                    const matchesSearch =
                        !search ||
                        notification.title
                            ?.toLowerCase()
                            .includes(
                                search.toLowerCase()
                            ) ||
                        notification.message
                            ?.toLowerCase()
                            .includes(
                                search.toLowerCase()
                            );

                    const isRead =
                        notification.isRead ===
                        true;

                    const matchesFilter =
                        filter ===
                            "ALL" ||
                        (filter ===
                            "READ" &&
                            isRead) ||
                        (filter ===
                            "UNREAD" &&
                            !isRead);

                    return (
                        matchesSearch &&
                        matchesFilter
                    );
                }
            );
        }, [
            notifications,
            search,
            filter,
        ]);

    /*
     * =========================================
     * COUNTS
     * =========================================
     */

    const totalNotifications =
        notifications.length;

    const unreadNotifications =
        notifications.filter(
            (item) =>
                item.isRead !== true
        ).length;

    const readNotifications =
        notifications.filter(
            (item) =>
                item.isRead === true
        ).length;

    /*
     * =========================================
     * SAVE
     * =========================================
     */

    const saveNotifications = (
        data
    ) => {
        setNotifications(data);

        setStorage(
            STORAGE_KEYS.NOTIFICATIONS,
            data
        );
    };

    /*
     * =========================================
     * MARK ONE AS READ
     * =========================================
     */

    const markAsRead = (
        notificationId
    ) => {
        const updated =
            notifications.map(
                (notification) =>
                    notification.id ===
                    notificationId
                        ? {
                              ...notification,
                              isRead: true,
                          }
                        : notification
            );

        saveNotifications(
            updated
        );
    };

    /*
     * =========================================
     * MARK ALL AS READ
     * =========================================
     */

    const markAllAsRead = () => {
        const updated =
            notifications.map(
                (notification) => ({
                    ...notification,
                    isRead: true,
                })
            );

        saveNotifications(
            updated
        );
    };

    /*
     * =========================================
     * DELETE NOTIFICATION
     * =========================================
     */

    const deleteNotification = (
        notificationId
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this notification?"
            );

        if (!confirmed) {
            return;
        }

        const updated =
            notifications.filter(
                (notification) =>
                    notification.id !==
                    notificationId
            );

        saveNotifications(
            updated
        );
    };

    /*
     * =========================================
     * DELETE ALL READ
     * =========================================
     */

    const deleteAllRead = () => {
        const confirmed =
            window.confirm(
                "Delete all read notifications?"
            );

        if (!confirmed) {
            return;
        }

        const updated =
            notifications.filter(
                (notification) =>
                    notification.isRead !==
                    true
            );

        saveNotifications(
            updated
        );
    };

    /*
     * =========================================
     * NOTIFICATION TYPE
     * =========================================
     */

    const getNotificationIcon =
        (type) => {
            switch (
                type?.toUpperCase()
            ) {
                case "USER":
                    return Users;

                case "SUBSCRIPTION":
                    return CreditCard;

                case "BUSINESS":
                    return Building2;

                case "WARNING":
                    return AlertTriangle;

                case "ERROR":
                    return XCircle;

                case "SUCCESS":
                    return Check;

                default:
                    return Info;
            }
        };

    const getNotificationStyle =
        (type) => {
            switch (
                type?.toUpperCase()
            ) {
                case "USER":
                    return "bg-blue-50 text-blue-600";

                case "SUBSCRIPTION":
                    return "bg-purple-50 text-purple-600";

                case "BUSINESS":
                    return "bg-orange-50 text-orange-600";

                case "WARNING":
                    return "bg-yellow-50 text-yellow-600";

                case "ERROR":
                    return "bg-red-50 text-red-600";

                case "SUCCESS":
                    return "bg-green-50 text-green-600";

                default:
                    return "bg-slate-100 text-slate-600";
            }
        };

    /*
     * =========================================
     * FORMAT DATE
     * =========================================
     */

    const formatDate = (
        date
    ) => {
        if (!date) {
            return "—";
        }

        const parsed =
            new Date(date);

        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {
            return date;
        }

        return parsed.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

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
                        Loading notifications...
                    </p>

                </div>

            </div>
        );
    }

    /*
     * =========================================
     * PAGE
     * =========================================
     */

    return (
        <div className="space-y-6">

            {/* =================================
                HEADER
            ================================== */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>

                    <div className="flex items-center gap-2">

                        <Bell
                            size={24}
                            className="text-slate-700"
                        />

                        <h1 className="text-2xl font-bold text-slate-900">
                            Notifications
                        </h1>

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage system
                        notifications and
                        alerts.
                    </p>

                </div>

                <div className="flex flex-wrap gap-2">

                    <button
                        type="button"
                        onClick={
                            markAllAsRead
                        }
                        disabled={
                            unreadNotifications ===
                            0
                        }
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        <CheckCheck
                            size={17}
                        />

                        Mark all read

                    </button>

                    <button
                        type="button"
                        onClick={
                            deleteAllRead
                        }
                        disabled={
                            readNotifications ===
                            0
                        }
                        className="flex items-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-3 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        <Trash2
                            size={17}
                        />

                        Delete read

                    </button>

                </div>

            </div>

            {/* =================================
                STATS
            ================================== */}

            <div className="grid gap-4 sm:grid-cols-3">

                <NotificationStat
                    title="Total"
                    value={
                        totalNotifications
                    }
                    icon={Bell}
                />

                <NotificationStat
                    title="Unread"
                    value={
                        unreadNotifications
                    }
                    icon={Bell}
                    type="warning"
                />

                <NotificationStat
                    title="Read"
                    value={
                        readNotifications
                    }
                    icon={CheckCheck}
                    type="success"
                />

            </div>

            {/* =================================
                SEARCH / FILTER
            ================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="flex flex-col gap-3 lg:flex-row">

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
                            placeholder="Search notifications..."
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                        />

                    </div>

                    <div className="flex items-center gap-2">

                        <Filter
                            size={17}
                            className="text-slate-400"
                        />

                        <select
                            value={
                                filter
                            }
                            onChange={(
                                event
                            ) =>
                                setFilter(
                                    event
                                        .target
                                        .value
                                )
                            }
                            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none"
                        >

                            <option value="ALL">
                                All Notifications
                            </option>

                            <option value="UNREAD">
                                Unread
                            </option>

                            <option value="READ">
                                Read
                            </option>

                        </select>

                    </div>

                </div>

            </div>

            {/* =================================
                NOTIFICATION LIST
            ================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {filteredNotifications.length ===
                0 ? (
                    <EmptyState />
                ) : (
                    <div>

                        {filteredNotifications.map(
                            (
                                notification
                            ) => {
                                const Icon =
                                    getNotificationIcon(
                                        notification.type
                                    );

                                const iconStyle =
                                    getNotificationStyle(
                                        notification.type
                                    );

                                const isRead =
                                    notification.isRead ===
                                    true;

                                return (
                                    <div
                                        key={
                                            notification.id
                                        }
                                        className={`border-b border-slate-100 p-5 transition last:border-b-0 ${
                                            !isRead
                                                ? "bg-slate-50/70"
                                                : "bg-white"
                                        }`}
                                    >

                                        <div className="flex gap-4">

                                            {/* ICON */}

                                            <div
                                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
                                            >

                                                <Icon
                                                    size={
                                                        20
                                                    }
                                                />

                                            </div>

                                            {/* CONTENT */}

                                            <div className="min-w-0 flex-1">

                                                <div className="flex flex-col justify-between gap-2 sm:flex-row">

                                                    <div className="flex items-center gap-2">

                                                        <h3
                                                            className={`text-sm ${
                                                                !isRead
                                                                    ? "font-bold text-slate-900"
                                                                    : "font-semibold text-slate-700"
                                                            }`}
                                                        >
                                                            {
                                                                notification.title
                                                            }
                                                        </h3>

                                                        {!isRead && (
                                                            <span className="h-2 w-2 rounded-full bg-slate-800" />
                                                        )}

                                                    </div>

                                                    <div className="flex items-center gap-1 text-xs text-slate-400">

                                                        <Clock
                                                            size={
                                                                13
                                                            }
                                                        />

                                                        {formatDate(
                                                            notification.createdAt
                                                        )}

                                                    </div>

                                                </div>

                                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                                    {
                                                        notification.message
                                                    }
                                                </p>

                                                {notification.type && (
                                                    <div className="mt-3">

                                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                                            {
                                                                notification.type
                                                            }
                                                        </span>

                                                    </div>
                                                )}

                                            </div>

                                            {/* ACTIONS */}

                                            <div className="flex shrink-0 items-start gap-1">

                                                {!isRead && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            markAsRead(
                                                                notification.id
                                                            )
                                                        }
                                                        title="Mark as read"
                                                        className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                                                    >

                                                        <Check
                                                            size={
                                                                17
                                                            }
                                                        />

                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        deleteNotification(
                                                            notification.id
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

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

            </div>

        </div>
    );
}

/* =========================================
   STAT CARD
========================================= */

function NotificationStat({
    title,
    value,
    icon: Icon,
    type = "default",
}) {
    const styles = {
        default:
            "bg-slate-100 text-slate-600",

        warning:
            "bg-orange-50 text-orange-600",

        success:
            "bg-emerald-50 text-emerald-600",
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

/* =========================================
   EMPTY STATE
========================================= */

function EmptyState() {
    return (
        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                <Bell
                    size={28}
                    className="text-slate-400"
                />

            </div>

            <h3 className="mt-4 text-base font-bold text-slate-800">
                No notifications found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-400">
                There are no notifications
                matching your current
                search or filter.
            </p>

        </div>
    );
}