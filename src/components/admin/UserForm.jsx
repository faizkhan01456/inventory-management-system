"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const EMPTY_FORM = {
    name: "",
    username: "",
    password: "",
    businessName: "",
    email: "",
    phone: "",
    plan: "BASIC",
};

export default function UserForm({
    initialData = null,
    onSubmit,
    onCancel,
}) {
    const [form, setForm] =
        useState(EMPTY_FORM);

    /*
     * Edit ke time initialData change hone par
     * form ko update karna zaroori hai.
     */
    useEffect(() => {
        if (initialData) {
            setForm({
                name: initialData.name || "",
                username:
                    initialData.username || "",
                password: "",
                businessName:
                    initialData.businessName || "",
                email: initialData.email || "",
                phone: initialData.phone || "",
                plan:
                    initialData.plan || "BASIC",
            });
        } else {
            setForm({
                ...EMPTY_FORM,
            });
        }
    }, [initialData]);

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const cleanedForm = {
            ...form,
            name: form.name.trim(),
            username:
                form.username.trim(),
            businessName:
                form.businessName.trim(),
            email:
                form.email.trim(),
            phone:
                form.phone.trim(),
        };

        if (!cleanedForm.name) {
            alert("Please enter full name.");
            return;
        }

        if (!cleanedForm.username) {
            alert("Please enter username.");
            return;
        }

        if (
            !initialData &&
            !cleanedForm.password
        ) {
            alert("Please enter password.");
            return;
        }

        if (
            !cleanedForm.businessName
        ) {
            alert(
                "Please enter business name."
            );
            return;
        }

        onSubmit(cleanedForm);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">
                        {initialData
                            ? "Edit User"
                            : "Create Business User"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        {initialData
                            ? "Update user account details."
                            : "Create login credentials for a business."}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                    <X size={20} />
                </button>
            </div>

            {/* FORM */}

            <div className="grid gap-5 sm:grid-cols-2">
                <Field
                    label="Full Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Rahul Sharma"
                    required
                />

                <Field
                    label="Username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="rahul123"
                    required
                />

                <Field
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={
                        initialData
                            ? "Leave blank to keep current"
                            : "Enter password"
                    }
                    required={!initialData}
                />

                <Field
                    label="Business Name"
                    name="businessName"
                    value={form.businessName}
                    onChange={handleChange}
                    placeholder="Rahul Electronics"
                    required
                />

                <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="business@example.com"
                />

                <Field
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                />

                {/* PLAN */}

                <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-slate-600">
                        Subscription Plan
                    </label>

                    <select
                        name="plan"
                        value={form.plan}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    >
                        <option value="FREE">
                            Free
                        </option>

                        <option value="BASIC">
                            Basic
                        </option>

                        <option value="PRO">
                            Pro
                        </option>

                        <option value="PREMIUM">
                            Premium
                        </option>

                        <option value="ENTERPRISE">
                            Enterprise
                        </option>
                    </select>
                </div>
            </div>

            {/* CREATE INFO */}

            {!initialData && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-800">
                        Demo Login
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-600">
                        After creating the user,
                        use the same username and
                        password on the login page.
                    </p>
                </div>
            )}

            {/* BUTTONS */}

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                    {initialData
                        ? "Update User"
                        : "Create User"}
                </button>
            </div>
        </form>
    );
}

/* INPUT FIELD */

function Field({
    label,
    name,
    value,
    onChange,
    placeholder,
    type = "text",
    required = false,
}) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-600">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}
            </label>

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                autoComplete={
                    type === "password"
                        ? "new-password"
                        : "off"
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
        </div>
    );
}