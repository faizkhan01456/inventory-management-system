"use client";

import Link from "next/link";

import {
    Eye,
    Pencil,
    Power,
    Trash2,
    User,
} from "lucide-react";

export default function UserTable({
    users,
    onToggleStatus,
    onDelete,
    onEdit,
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            User
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Business
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Plan
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Status
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Created
                        </th>

                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                        <tr
                            key={user.id}
                            className="transition hover:bg-slate-50"
                        >
                            {/* USER */}

                            <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                        <User
                                            size={18}
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {
                                                user.name
                                            }
                                        </p>

                                        <p className="text-xs text-slate-400">
                                            @
                                            {
                                                user.username
                                            }
                                        </p>
                                    </div>
                                </div>
                            </td>

                            {/* BUSINESS */}

                            <td className="px-5 py-4 text-sm text-slate-600">
                                {user.businessName ||
                                    "—"}
                            </td>

                            {/* PLAN */}

                            <td className="px-5 py-4">
                                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                                    {user.plan ||
                                        "BASIC"}
                                </span>
                            </td>

                            {/* STATUS */}

                            <td className="px-5 py-4">
                                <span
                                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                                        user.status ===
                                        "ACTIVE"
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "bg-red-50 text-red-600"
                                    }`}
                                >
                                    {
                                        user.status
                                    }
                                </span>
                            </td>

                            {/* CREATED */}

                            <td className="px-5 py-4 text-sm text-slate-500">
                                {user.createdAt ||
                                    "—"}
                            </td>

                            {/* ACTIONS */}

                            <td className="px-5 py-4">
                                <div className="flex justify-end gap-1">
                                    {/* VIEW */}

                                    <Link
                                        href={`/admin/users/${user.id}`}
                                        title="View"
                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                    >
                                        <Eye
                                            size={
                                                17
                                            }
                                        />
                                    </Link>

                                    {/* EDIT */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onEdit(
                                                user
                                            )
                                        }
                                        title="Edit"
                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        <Pencil
                                            size={
                                                17
                                            }
                                        />
                                    </button>

                                    {/* STATUS */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onToggleStatus(
                                                user.id
                                            )
                                        }
                                        title={
                                            user.status ===
                                            "ACTIVE"
                                                ? "Deactivate"
                                                : "Activate"
                                        }
                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                                    >
                                        <Power
                                            size={
                                                17
                                            }
                                        />
                                    </button>

                                    {/* DELETE */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onDelete(
                                                user.id
                                            )
                                        }
                                        title="Delete"
                                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
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
                    ))}
                </tbody>
            </table>

            {/* EMPTY */}

            {users.length === 0 && (
                <div className="p-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <UsersIcon />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-slate-700">
                        No users found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Create your first
                        business user.
                    </p>
                </div>
            )}
        </div>
    );
}

function UsersIcon() {
    return (
        <User
            size={22}
            className="text-slate-400"
        />
    );
}