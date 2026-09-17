"use client";

import { useEffect, useState } from "react";

import {
    Settings,
    Save,
    RefreshCw,
    Bell,
    CreditCard,
    Users,
    Package,
    Globe,
    Database,
    AlertTriangle,
    RotateCcw,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    removeStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

import {
    demoUsers,
    businesses as demoBusinesses,
    plans as demoPlans,
    subscriptions as demoSubscriptions,
    notifications as demoNotifications,
} from "@/data/demoData";

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        systemName: "InventoryPro",
        currency: "INR",
        currencySymbol: "₹",
        timezone: "Asia/Kolkata",
        dateFormat: "DD/MM/YYYY",

        emailNotifications: true,
        subscriptionNotifications: true,
        userNotifications: true,
        lowStockNotifications: true,
    });

    const [saving, setSaving] =
        useState(false);

    const [saved, setSaved] =
        useState(false);

    /*
     * =========================================
     * LOAD SETTINGS
     * =========================================
     */

    useEffect(() => {
        const storedSettings =
            getStorage(
                STORAGE_KEYS.SETTINGS,
                null
            );

        if (
            storedSettings &&
            typeof storedSettings ===
                "object"
        ) {
            setSettings({
                ...settings,
                ...storedSettings,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /*
     * =========================================
     * INPUT CHANGE
     * =========================================
     */

    const handleChange = (
        field,
        value
    ) => {
        setSettings((previous) => ({
            ...previous,
            [field]: value,
        }));

        setSaved(false);
    };

    /*
     * =========================================
     * SAVE SETTINGS
     * =========================================
     */

    const handleSave = () => {
        setSaving(true);

        const selectedCurrency =
            currencyOptions.find(
                (currency) =>
                    currency.value ===
                    settings.currency
            );

        const updatedSettings = {
            ...settings,
            currencySymbol:
                selectedCurrency
                    ?.symbol ||
                settings.currencySymbol ||
                "₹",
        };

        setStorage(
            STORAGE_KEYS.SETTINGS,
            updatedSettings
        );

        setSettings(
            updatedSettings
        );

        setTimeout(() => {
            setSaving(false);
            setSaved(true);

            setTimeout(() => {
                setSaved(false);
            }, 3000);
        }, 500);
    };

    /*
     * =========================================
     * RESET SETTINGS
     * =========================================
     */

    const handleResetSettings =
        () => {
            const confirmed =
                window.confirm(
                    "Reset all system settings to default?"
                );

            if (!confirmed) {
                return;
            }

            const defaultSettings = {
                systemName:
                    "InventoryPro",
                currency: "INR",
                currencySymbol: "₹",
                timezone:
                    "Asia/Kolkata",
                dateFormat:
                    "DD/MM/YYYY",

                emailNotifications:
                    true,
                subscriptionNotifications:
                    true,
                userNotifications:
                    true,
                lowStockNotifications:
                    true,
            };

            setStorage(
                STORAGE_KEYS.SETTINGS,
                defaultSettings
            );

            setSettings(
                defaultSettings
            );

            setSaved(true);

            setTimeout(() => {
                setSaved(false);
            }, 3000);
        };

    /*
     * =========================================
     * RESET DEMO DATA
     * =========================================
     */

    const handleResetDemoData =
        () => {
            const confirmed =
                window.confirm(
                    "This will replace current demo Users, Businesses, Plans, Subscriptions and Notifications with the default demo data. Continue?"
                );

            if (!confirmed) {
                return;
            }

            setStorage(
                STORAGE_KEYS.USERS,
                demoUsers
            );

            setStorage(
                STORAGE_KEYS.BUSINESSES,
                demoBusinesses
            );

            setStorage(
                STORAGE_KEYS.PLANS,
                demoPlans
            );

            setStorage(
                STORAGE_KEYS.SUBSCRIPTIONS,
                demoSubscriptions
            );

            setStorage(
                STORAGE_KEYS.NOTIFICATIONS,
                demoNotifications
            );

            alert(
                "Demo data has been reset successfully."
            );

            window.location.reload();
        };

    /*
     * =========================================
     * CLEAR ALL DATA
     * =========================================
     */

    const handleClearAllData =
        () => {
            const firstConfirm =
                window.confirm(
                    "WARNING: This will delete all InventoryPro localStorage data. Continue?"
                );

            if (!firstConfirm) {
                return;
            }

            const secondConfirm =
                window.confirm(
                    "Are you absolutely sure? This action cannot be undone."
                );

            if (!secondConfirm) {
                return;
            }

            Object.values(
                STORAGE_KEYS
            ).forEach((key) => {
                removeStorage(key);
            });

            alert(
                "All local demo data has been cleared."
            );

            window.location.href =
                "/login";
        };

    return (
        <div className="space-y-6">

            {/* =================================
                HEADER
            ================================== */}

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>

                    <div className="flex items-center gap-2">

                        <Settings
                            size={24}
                            className="text-slate-700"
                        />

                        <h1 className="text-2xl font-bold text-slate-900">
                            Settings
                        </h1>

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage your InventoryPro
                        system configuration.
                    </p>

                </div>

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={
                            handleResetSettings
                        }
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >

                        <RotateCcw
                            size={17}
                        />

                        Reset

                    </button>

                    <button
                        type="button"
                        onClick={
                            handleSave
                        }
                        disabled={
                            saving
                        }
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        {saving ? (
                            <RefreshCw
                                size={17}
                                className="animate-spin"
                            />
                        ) : (
                            <Save
                                size={17}
                            />
                        )}

                        {saving
                            ? "Saving..."
                            : "Save Settings"}

                    </button>

                </div>

            </div>

            {/* =================================
                SUCCESS MESSAGE
            ================================== */}

            {saved && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">

                    <Save
                        size={17}
                    />

                    Settings saved
                    successfully.

                </div>
            )}

            {/* =================================
                GENERAL SETTINGS
            ================================== */}

            <SettingsSection
                icon={Settings}
                title="General Settings"
                description="Basic information about your system."
            >

                <div className="grid gap-5 md:grid-cols-2">

                    <InputField
                        label="System Name"
                        value={
                            settings.systemName
                        }
                        onChange={(value) =>
                            handleChange(
                                "systemName",
                                value
                            )
                        }
                        placeholder="InventoryPro"
                    />

                    <SelectField
                        label="Currency"
                        value={
                            settings.currency
                        }
                        onChange={(value) =>
                            handleChange(
                                "currency",
                                value
                            )
                        }
                        options={
                            currencyOptions
                        }
                    />

                    <SelectField
                        label="Timezone"
                        value={
                            settings.timezone
                        }
                        onChange={(value) =>
                            handleChange(
                                "timezone",
                                value
                            )
                        }
                        options={
                            timezoneOptions
                        }
                    />

                    <SelectField
                        label="Date Format"
                        value={
                            settings.dateFormat
                        }
                        onChange={(value) =>
                            handleChange(
                                "dateFormat",
                                value
                            )
                        }
                        options={[
                            {
                                value:
                                    "DD/MM/YYYY",
                                label:
                                    "DD/MM/YYYY",
                            },
                            {
                                value:
                                    "MM/DD/YYYY",
                                label:
                                    "MM/DD/YYYY",
                            },
                            {
                                value:
                                    "YYYY-MM-DD",
                                label:
                                    "YYYY-MM-DD",
                            },
                        ]}
                    />

                </div>

            </SettingsSection>

            {/* =================================
                NOTIFICATION SETTINGS
            ================================== */}

            <SettingsSection
                icon={Bell}
                title="Notification Settings"
                description="Control which system notifications are enabled."
            >

                <div className="divide-y divide-slate-100">

                    <ToggleRow
                        icon={Bell}
                        title="Email Notifications"
                        description="Receive important system notifications by email."
                        enabled={
                            settings.emailNotifications
                        }
                        onChange={(value) =>
                            handleChange(
                                "emailNotifications",
                                value
                            )
                        }
                    />

                    <ToggleRow
                        icon={
                            CreditCard
                        }
                        title="Subscription Notifications"
                        description="Get notified about new, expired and cancelled subscriptions."
                        enabled={
                            settings.subscriptionNotifications
                        }
                        onChange={(value) =>
                            handleChange(
                                "subscriptionNotifications",
                                value
                            )
                        }
                    />

                    <ToggleRow
                        icon={Users}
                        title="User Notifications"
                        description="Get notified when users are created or updated."
                        enabled={
                            settings.userNotifications
                        }
                        onChange={(value) =>
                            handleChange(
                                "userNotifications",
                                value
                            )
                        }
                    />

                    <ToggleRow
                        icon={Package}
                        title="Low Stock Notifications"
                        description="Receive alerts when inventory items reach their low stock level."
                        enabled={
                            settings.lowStockNotifications
                        }
                        onChange={(value) =>
                            handleChange(
                                "lowStockNotifications",
                                value
                            )
                        }
                    />

                </div>

            </SettingsSection>

            {/* =================================
                SYSTEM INFORMATION
            ================================== */}

            <SettingsSection
                icon={Globe}
                title="System Information"
                description="Current application configuration."
            >

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <InfoCard
                        label="Application"
                        value={
                            settings.systemName
                        }
                    />

                    <InfoCard
                        label="Currency"
                        value={`${settings.currency} (${settings.currencySymbol})`}
                    />

                    <InfoCard
                        label="Timezone"
                        value={
                            settings.timezone
                        }
                    />

                    <InfoCard
                        label="Date Format"
                        value={
                            settings.dateFormat
                        }
                    />

                </div>

            </SettingsSection>

            {/* =================================
                DEMO / DATA MANAGEMENT
            ================================== */}

            <SettingsSection
                icon={Database}
                title="Demo & Data Management"
                description="Manage local demo data used by this frontend-only application."
            >

                <div className="grid gap-4 md:grid-cols-2">

                    <DataAction
                        icon={
                            RotateCcw
                        }
                        title="Reset Demo Data"
                        description="Restore demo users, businesses, plans, subscriptions and notifications."
                        buttonText="Reset Demo Data"
                        onClick={
                            handleResetDemoData
                        }
                    />

                    <DataAction
                        icon={
                            AlertTriangle
                        }
                        title="Clear All Data"
                        description="Delete all locally stored InventoryPro data from this browser."
                        buttonText="Clear All Data"
                        danger
                        onClick={
                            handleClearAllData
                        }
                    />

                </div>

            </SettingsSection>

            {/* =================================
                DEMO NOTICE
            ================================== */}

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">

                <div className="flex gap-3">

                    <AlertTriangle
                        size={20}
                        className="mt-0.5 shrink-0 text-amber-600"
                    />

                    <div>

                        <h3 className="text-sm font-bold text-amber-800">
                            Frontend Demo Mode
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-amber-700">
                            This application is
                            currently using
                            browser localStorage
                            for demo data. In the
                            production version,
                            these settings should
                            be stored securely in
                            the backend database.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

/* =========================================
   CURRENCY OPTIONS
========================================= */

const currencyOptions = [
    {
        value: "INR",
        label: "Indian Rupee (INR)",
        symbol: "₹",
    },
    {
        value: "USD",
        label: "US Dollar (USD)",
        symbol: "$",
    },
    {
        value: "EUR",
        label: "Euro (EUR)",
        symbol: "€",
    },
    {
        value: "GBP",
        label: "British Pound (GBP)",
        symbol: "£",
    },
    {
        value: "AED",
        label: "UAE Dirham (AED)",
        symbol: "د.إ",
    },
];

/* =========================================
   TIMEZONE OPTIONS
========================================= */

const timezoneOptions = [
    {
        value: "Asia/Kolkata",
        label: "India — Asia/Kolkata",
    },
    {
        value: "Asia/Dubai",
        label: "Dubai — Asia/Dubai",
    },
    {
        value: "Asia/Singapore",
        label: "Singapore — Asia/Singapore",
    },
    {
        value: "Europe/London",
        label: "London — Europe/London",
    },
    {
        value: "America/New_York",
        label: "New York — America/New_York",
    },
    {
        value: "America/Los_Angeles",
        label: "Los Angeles — America/Los_Angeles",
    },
];

/* =========================================
   SETTINGS SECTION
========================================= */

function SettingsSection({
    icon: Icon,
    title,
    description,
    children,
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-start gap-4 border-b border-slate-200 p-6">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">

                    <Icon
                        size={20}
                        className="text-slate-600"
                    />

                </div>

                <div>

                    <h2 className="text-base font-bold text-slate-900">
                        {title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        {description}
                    </p>

                </div>

            </div>

            <div className="p-6">
                {children}
            </div>

        </div>
    );
}

/* =========================================
   INPUT FIELD
========================================= */

function InputField({
    label,
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
                type="text"
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                placeholder={
                    placeholder
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
            />

        </div>
    );
}

/* =========================================
   SELECT FIELD
========================================= */

function SelectField({
    label,
    value,
    onChange,
    options,
}) {
    return (
        <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </label>

            <select
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
            >

                {options.map(
                    (option) => (
                        <option
                            key={
                                option.value
                            }
                            value={
                                option.value
                            }
                        >
                            {
                                option.label
                            }
                        </option>
                    )
                )}

            </select>

        </div>
    );
}

/* =========================================
   TOGGLE ROW
========================================= */

function ToggleRow({
    icon: Icon,
    title,
    description,
    enabled,
    onChange,
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-5 first:pt-0 last:pb-0">

            <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">

                    <Icon
                        size={17}
                        className="text-slate-600"
                    />

                </div>

                <div>

                    <p className="text-sm font-semibold text-slate-800">
                        {title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                        {description}
                    </p>

                </div>

            </div>

            <button
                type="button"
                onClick={() =>
                    onChange(
                        !enabled
                    )
                }
                aria-label={
                    title
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    enabled
                        ? "bg-slate-900"
                        : "bg-slate-300"
                }`}
            >

                <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                        enabled
                            ? "left-6"
                            : "left-1"
                    }`}
                />

            </button>

        </div>
    );
}

/* =========================================
   INFO CARD
========================================= */

function InfoCard({
    label,
    value,
}) {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

            <p className="text-xs font-medium text-slate-400">
                {label}
            </p>

            <p className="mt-2 break-words text-sm font-bold text-slate-800">
                {value}
            </p>

        </div>
    );
}

/* =========================================
   DATA ACTION
========================================= */

function DataAction({
    icon: Icon,
    title,
    description,
    buttonText,
    onClick,
    danger = false,
}) {
    return (
        <div
            className={`rounded-xl border p-5 ${
                danger
                    ? "border-red-100 bg-red-50/50"
                    : "border-slate-100 bg-slate-50"
            }`}
        >

            <div className="flex items-start gap-3">

                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        danger
                            ? "bg-red-100 text-red-600"
                            : "bg-white text-slate-600"
                    }`}
                >

                    <Icon
                        size={19}
                    />

                </div>

                <div className="min-w-0">

                    <h3 className="text-sm font-bold text-slate-800">
                        {title}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        {description}
                    </p>

                </div>

            </div>

            <button
                type="button"
                onClick={onClick}
                className={`mt-4 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
                    danger
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
            >
                {buttonText}
            </button>

        </div>
    );
}