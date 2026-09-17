"use client";

import { useEffect, useState } from "react";
import {
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    Save,
    ShieldCheck,
    CheckCircle,
    AlertCircle,
} from "lucide-react";

import {
    getCurrentUser,
    getUsers,
    saveUsers,
    login,
} from "@/lib/auth";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

const ADMIN_PROFILE_KEY = "inventory_admin_profile";

export default function AdminProfilePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [profile, setProfile] = useState({
        name: "",
        username: "",
        email: "",
        phone: "",
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [profileMessage, setProfileMessage] = useState({
        type: "",
        text: "",
    });

    const [passwordMessage, setPasswordMessage] = useState({
        type: "",
        text: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = () => {
        const currentUser = getCurrentUser();

        if (!currentUser) {
            setLoading(false);
            return;
        }

        setUser(currentUser);

        const savedAdminProfile = getStorage(
            ADMIN_PROFILE_KEY,
            null
        );

        setProfile({
            name:
                savedAdminProfile?.name ||
                currentUser.name ||
                currentUser.fullName ||
                "Super Admin",

            username:
                savedAdminProfile?.username ||
                currentUser.username ||
                "superadmin",

            email:
                savedAdminProfile?.email ||
                currentUser.email ||
                "",

            phone:
                savedAdminProfile?.phone ||
                currentUser.phone ||
                "",
        });

        setLoading(false);
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;

        setProfile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        setPasswordForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const showProfileMessage = (type, text) => {
        setProfileMessage({
            type,
            text,
        });

        setTimeout(() => {
            setProfileMessage({
                type: "",
                text: "",
            });
        }, 3000);
    };

    const showPasswordMessage = (type, text) => {
        setPasswordMessage({
            type,
            text,
        });

        setTimeout(() => {
            setPasswordMessage({
                type: "",
                text: "",
            });
        }, 3000);
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();

        if (!profile.name.trim()) {
            showProfileMessage("error", "Name is required.");
            return;
        }

        if (!profile.username.trim()) {
            showProfileMessage("error", "Username is required.");
            return;
        }

        /*
         * Save admin profile separately.
         * This is useful for Super Admin because the
         * Super Admin is not stored inside normal users.
         */
        setStorage(ADMIN_PROFILE_KEY, {
            ...profile,
            updatedAt: new Date().toISOString(),
        });

        /*
         * Also update normal user record if current account
         * exists inside inventory_users.
         */
        const users = getUsers();

        const updatedUsers = users.map((item) => {
            if (
                item.id === user?.id ||
                item.username?.toLowerCase() ===
                    user?.username?.toLowerCase()
            ) {
                return {
                    ...item,
                    name: profile.name,
                    username: profile.username,
                    email: profile.email,
                    phone: profile.phone,
                    updatedAt: new Date().toISOString(),
                };
            }

            return item;
        });

        saveUsers(updatedUsers);

        /*
         * Update current auth session.
         */
        const currentAuth = getStorage(
            STORAGE_KEYS.AUTH,
            null
        );

        if (currentAuth) {
            setStorage(STORAGE_KEYS.AUTH, {
                ...currentAuth,
                name: profile.name,
                username: profile.username,
                email: profile.email,
                phone: profile.phone,
            });
        }

        setUser((prev) => ({
            ...prev,
            ...profile,
        }));

        showProfileMessage(
            "success",
            "Profile updated successfully."
        );
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();

        setPasswordMessage({
            type: "",
            text: "",
        });

        if (!passwordForm.currentPassword) {
            showPasswordMessage(
                "error",
                "Enter your current password."
            );
            return;
        }

        if (!passwordForm.newPassword) {
            showPasswordMessage(
                "error",
                "Enter your new password."
            );
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            showPasswordMessage(
                "error",
                "New password must be at least 6 characters."
            );
            return;
        }

        if (
            passwordForm.newPassword !==
            passwordForm.confirmPassword
        ) {
            showPasswordMessage(
                "error",
                "New password and confirm password do not match."
            );
            return;
        }

        /*
         * First try the current credentials.
         */
        const currentUsername =
            profile.username || user?.username;

        const result = login(
            currentUsername,
            passwordForm.currentPassword
        );

        if (!result.success) {
            showPasswordMessage(
                "error",
                "Current password is incorrect."
            );
            return;
        }

        /*
         * Store changed Super Admin password.
         */
        const existingAdminProfile =
            getStorage(ADMIN_PROFILE_KEY, {});

        setStorage(ADMIN_PROFILE_KEY, {
            ...existingAdminProfile,
            ...profile,
            password: passwordForm.newPassword,
            updatedAt: new Date().toISOString(),
        });

        /*
         * If admin also exists in users, update password there.
         */
        const users = getUsers();

        const updatedUsers = users.map((item) => {
            if (
                item.id === user?.id ||
                item.username?.toLowerCase() ===
                    user?.username?.toLowerCase()
            ) {
                return {
                    ...item,
                    password: passwordForm.newPassword,
                    updatedAt: new Date().toISOString(),
                };
            }

            return item;
        });

        saveUsers(updatedUsers);

        /*
         * Keep current auth session.
         */
        const currentAuth = getStorage(
            STORAGE_KEYS.AUTH,
            null
        );

        if (currentAuth) {
            setStorage(STORAGE_KEYS.AUTH, {
                ...currentAuth,
                name: profile.name,
                username: profile.username,
                email: profile.email,
                phone: profile.phone,
            });
        }

        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

        showPasswordMessage(
            "success",
            "Password changed successfully."
        );
    };

    const PasswordInput = ({
        name,
        placeholder,
        value,
        show,
        setShow,
    }) => {
        return (
            <div className="relative">
                <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                    type={show ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={handlePasswordChange}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                    {show ? (
                        <EyeOff size={18} />
                    ) : (
                        <Eye size={18} />
                    )}
                </button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-sm text-gray-500">
                    Loading profile...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    My Profile
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Manage your admin profile and account security.
                </p>
            </div>

            {/* Profile Card */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <ShieldCheck size={42} />
                        </div>

                        <h2 className="mt-4 text-xl font-bold text-gray-900">
                            {profile.name || "Super Admin"}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Super Administrator
                        </p>

                        <div className="mt-4 rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-green-700">
                            Active Account
                        </div>
                    </div>
                </div>

                {/* Edit Profile */}
                <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Profile Information
                        </h2>

                        <p className="text-sm text-gray-500">
                            Update your personal information.
                        </p>
                    </div>

                    {profileMessage.text && (
                        <div
                            className={`mb-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
                                profileMessage.type === "success"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                            }`}
                        >
                            {profileMessage.type === "success" ? (
                                <CheckCircle size={18} />
                            ) : (
                                <AlertCircle size={18} />
                            )}

                            {profileMessage.text}
                        </div>
                    )}

                    <form
                        onSubmit={handleProfileSubmit}
                        className="grid grid-cols-1 gap-5 md:grid-cols-2"
                    >
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Full Name
                            </label>

                            <div className="relative">
                                <User
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    name="name"
                                    value={profile.name}
                                    onChange={handleProfileChange}
                                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Username
                            </label>

                            <div className="relative">
                                <User
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    name="username"
                                    value={profile.username}
                                    onChange={handleProfileChange}
                                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Email
                            </label>

                            <div className="relative">
                                <Mail
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    onChange={handleProfileChange}
                                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Phone
                            </label>

                            <div className="relative">
                                <Phone
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="tel"
                                    name="phone"
                                    value={profile.phone}
                                    onChange={handleProfileChange}
                                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                <Save size={18} />
                                Save Profile
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Change Password */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Lock size={20} />
                        Change Password
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Update your admin account password.
                    </p>
                </div>

                {passwordMessage.text && (
                    <div
                        className={`mb-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
                            passwordMessage.type === "success"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                        }`}
                    >
                        {passwordMessage.type === "success" ? (
                            <CheckCircle size={18} />
                        ) : (
                            <AlertCircle size={18} />
                        )}

                        {passwordMessage.text}
                    </div>
                )}

                <form
                    onSubmit={handlePasswordSubmit}
                    className="grid grid-cols-1 gap-5 md:grid-cols-3"
                >
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Current Password
                        </label>

                        <PasswordInput
                            name="currentPassword"
                            placeholder="Current password"
                            value={passwordForm.currentPassword}
                            show={showCurrent}
                            setShow={setShowCurrent}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            New Password
                        </label>

                        <PasswordInput
                            name="newPassword"
                            placeholder="New password"
                            value={passwordForm.newPassword}
                            show={showNew}
                            setShow={setShowNew}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>

                        <PasswordInput
                            name="confirmPassword"
                            placeholder="Confirm password"
                            value={passwordForm.confirmPassword}
                            show={showConfirm}
                            setShow={setShowConfirm}
                        />
                    </div>

                    <div className="md:col-span-3">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            <Lock size={18} />
                            Change Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}