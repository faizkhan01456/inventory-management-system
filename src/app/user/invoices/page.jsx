"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    Eye,
    Trash2,
    FileText,
    IndianRupee,
    CheckCircle,
    Clock,
    XCircle,
    X,
    Save,
    RefreshCw,
} from "lucide-react";

import { STORAGE_KEYS, getStorage, setStorage } from "@/lib/storage";

const INVOICES_KEY = "inventory_invoices";

const emptyForm = {
    customerId: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    paymentStatus: "UNPAID",
    discount: 0,
    tax: 0,
    notes: "",
    items: [
        {
            productId: "",
            productName: "",
            quantity: 1,
            price: 0,
        },
    ],
};

function generateInvoiceNumber(invoices) {
    const year = new Date().getFullYear();

    const numbers = invoices
        .map((invoice) => {
            const match = String(invoice.invoiceNumber || "").match(/(\d+)$/);
            return match ? Number(match[1]) : 0;
        })
        .filter(Boolean);

    const nextNumber = numbers.length ? Math.max(...numbers) + 1 : 1;

    return `INV-${year}-${String(nextNumber).padStart(4, "0")}`;
}

function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function normalizeInvoice(invoice) {
    const items = Array.isArray(invoice.items)
        ? invoice.items.map((item) => ({
              productId: item.productId || item.id || "",
              productName:
                  item.productName ||
                  item.name ||
                  item.product?.name ||
                  "Product",
              quantity: Number(item.quantity || item.qty || 1),
              price: Number(
                  item.price ||
                      item.salePrice ||
                      item.sellingPrice ||
                      item.unitPrice ||
                      0
              ),
          }))
        : [];

    const subtotal =
        Number(invoice.subtotal || 0) ||
        items.reduce(
            (sum, item) =>
                sum + Number(item.quantity || 0) * Number(item.price || 0),
            0
        );

    const discount = Number(invoice.discount || 0);
    const tax = Number(invoice.tax || 0);

    const grandTotal =
        Number(invoice.grandTotal || invoice.total || invoice.amount || 0) ||
        Math.max(subtotal - discount + tax, 0);

    return {
        ...invoice,
        items,
        subtotal,
        discount,
        tax,
        grandTotal,
        paymentStatus: invoice.paymentStatus || "UNPAID",
        status: invoice.status || "ACTIVE",
    };
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [paymentFilter, setPaymentFilter] = useState("ALL");

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    function loadData() {
        const storedInvoices = getStorage(INVOICES_KEY, []);
        const storedCustomers = getStorage(
            STORAGE_KEYS.CUSTOMERS,
            []
        );
        const storedProducts = getStorage(
            STORAGE_KEYS.PRODUCTS,
            []
        );

        setInvoices(
            Array.isArray(storedInvoices)
                ? storedInvoices.map(normalizeInvoice)
                : []
        );

        setCustomers(
            Array.isArray(storedCustomers) ? storedCustomers : []
        );

        setProducts(
            Array.isArray(storedProducts) ? storedProducts : []
        );
    }

    const filteredInvoices = useMemo(() => {
        const query = search.trim().toLowerCase();

        return invoices.filter((invoice) => {
            const matchesSearch =
                !query ||
                String(invoice.invoiceNumber || "")
                    .toLowerCase()
                    .includes(query) ||
                String(invoice.customerName || "")
                    .toLowerCase()
                    .includes(query) ||
                String(invoice.customerPhone || "")
                    .toLowerCase()
                    .includes(query);

            const matchesStatus =
                statusFilter === "ALL" ||
                String(invoice.status || "").toUpperCase() === statusFilter;

            const matchesPayment =
                paymentFilter === "ALL" ||
                String(invoice.paymentStatus || "").toUpperCase() ===
                    paymentFilter;

            return matchesSearch && matchesStatus && matchesPayment;
        });
    }, [invoices, search, statusFilter, paymentFilter]);

    const stats = useMemo(() => {
        const total = invoices.length;

        const paid = invoices.filter(
            (invoice) =>
                String(invoice.paymentStatus).toUpperCase() === "PAID"
        ).length;

        const unpaid = invoices.filter(
            (invoice) =>
                String(invoice.paymentStatus).toUpperCase() === "UNPAID"
        ).length;

        const cancelled = invoices.filter(
            (invoice) =>
                String(invoice.status).toUpperCase() === "CANCELLED"
        ).length;

        const revenue = invoices
            .filter(
                (invoice) =>
                    String(invoice.paymentStatus).toUpperCase() === "PAID"
            )
            .reduce(
                (sum, invoice) => sum + Number(invoice.grandTotal || 0),
                0
            );

        const outstanding = invoices
            .filter(
                (invoice) =>
                    String(invoice.paymentStatus).toUpperCase() !== "PAID" &&
                    String(invoice.status).toUpperCase() !== "CANCELLED"
            )
            .reduce(
                (sum, invoice) => sum + Number(invoice.grandTotal || 0),
                0
            );

        return {
            total,
            paid,
            unpaid,
            cancelled,
            revenue,
            outstanding,
        };
    }, [invoices]);

    function updateForm(field, value) {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    function updateItem(index, field, value) {
        setForm((prev) => {
            const items = [...prev.items];

            items[index] = {
                ...items[index],
                [field]: value,
            };

            return {
                ...prev,
                items,
            };
        });
    }

    function handleProductChange(index, productId) {
        const product = products.find(
            (item) => String(item.id) === String(productId)
        );

        setForm((prev) => {
            const items = [...prev.items];

            items[index] = {
                ...items[index],
                productId,
                productName: product?.name || product?.productName || "",
                price: Number(
                    product?.sellingPrice ||
                        product?.salePrice ||
                        product?.price ||
                        0
                ),
            };

            return {
                ...prev,
                items,
            };
        });
    }

    function handleCustomerChange(customerId) {
        const customer = customers.find(
            (item) => String(item.id) === String(customerId)
        );

        if (!customer) {
            updateForm("customerId", "");
            return;
        }

        setForm((prev) => ({
            ...prev,
            customerId,
            customerName:
                customer.name ||
                customer.customerName ||
                customer.fullName ||
                "",
            customerPhone:
                customer.phone ||
                customer.mobile ||
                customer.mobileNumber ||
                "",
            customerEmail: customer.email || "",
            customerAddress:
                customer.address ||
                customer.billingAddress ||
                "",
        }));
    }

    function addItem() {
        setForm((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    productId: "",
                    productName: "",
                    quantity: 1,
                    price: 0,
                },
            ],
        }));
    }

    function removeItem(index) {
        setForm((prev) => {
            if (prev.items.length === 1) {
                return prev;
            }

            return {
                ...prev,
                items: prev.items.filter((_, i) => i !== index),
            };
        });
    }

    const subtotal = form.items.reduce(
        (sum, item) =>
            sum +
            Number(item.quantity || 0) * Number(item.price || 0),
        0
    );

    const discount = Number(form.discount || 0);
    const tax = Number(form.tax || 0);

    const grandTotal = Math.max(
        subtotal - discount + tax,
        0
    );

    function openCreateModal() {
        setForm({
            ...emptyForm,
            invoiceDate: new Date()
                .toISOString()
                .split("T")[0],
        });

        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setForm(emptyForm);
    }

    function handleSaveInvoice(e) {
        e.preventDefault();

        if (!form.customerName.trim()) {
            alert("Please enter customer name.");
            return;
        }

        const validItems = form.items.filter(
            (item) =>
                item.productName &&
                Number(item.quantity) > 0 &&
                Number(item.price) >= 0
        );

        if (!validItems.length) {
            alert("Please add at least one valid product.");
            return;
        }

        setSaving(true);

        const invoiceNumber = generateInvoiceNumber(invoices);
        const now = new Date().toISOString();

        const newInvoice = normalizeInvoice({
            id: `invoice_${Date.now()}`,
            invoiceNumber,
            customerId: form.customerId,
            customerName: form.customerName.trim(),
            customerPhone: form.customerPhone.trim(),
            customerEmail: form.customerEmail.trim(),
            customerAddress: form.customerAddress.trim(),
            items: validItems,
            subtotal,
            discount,
            tax,
            grandTotal,
            paymentStatus: form.paymentStatus,
            status: "ACTIVE",
            invoiceDate: form.invoiceDate,
            dueDate: form.dueDate,
            notes: form.notes.trim(),
            createdAt: now,
            updatedAt: now,
        });

        const updated = [newInvoice, ...invoices];

        setStorage(INVOICES_KEY, updated);
        setInvoices(updated);

        setSaving(false);
        closeModal();

        alert(`Invoice ${invoiceNumber} created successfully.`);
    }

    function deleteInvoice(id) {
        const invoice = invoices.find(
            (item) => String(item.id) === String(id)
        );

        if (!invoice) return;

        const confirmed = window.confirm(
            `Delete invoice ${invoice.invoiceNumber}?`
        );

        if (!confirmed) return;

        const updated = invoices.filter(
            (item) => String(item.id) !== String(id)
        );

        setStorage(INVOICES_KEY, updated);
        setInvoices(updated);
    }

    function toggleStatus(id) {
        const updated = invoices.map((invoice) => {
            if (String(invoice.id) !== String(id)) {
                return invoice;
            }

            return {
                ...invoice,
                status:
                    String(invoice.status).toUpperCase() === "CANCELLED"
                        ? "ACTIVE"
                        : "CANCELLED",
                updatedAt: new Date().toISOString(),
            };
        });

        setStorage(INVOICES_KEY, updated);
        setInvoices(updated);
    }

    function getPaymentBadge(status) {
        const value = String(status || "").toUpperCase();

        if (value === "PAID") {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle size={13} />
                    Paid
                </span>
            );
        }

        if (value === "PARTIAL") {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    <Clock size={13} />
                    Partial
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                <Clock size={13} />
                Unpaid
            </span>
        );
    }

    function getStatusBadge(status) {
        const value = String(status || "").toUpperCase();

        if (value === "CANCELLED") {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                    <XCircle size={13} />
                    Cancelled
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                <CheckCircle size={13} />
                Active
            </span>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Invoices
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage customer invoices and payment records.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={loadData}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
                    >
                        <Plus size={18} />
                        Create Invoice
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Total Invoices
                            </p>
                            <h3 className="mt-1 text-2xl font-bold text-gray-900">
                                {stats.total}
                            </h3>
                        </div>

                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                            <FileText size={21} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Paid
                            </p>
                            <h3 className="mt-1 text-2xl font-bold text-gray-900">
                                {stats.paid}
                            </h3>
                        </div>

                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                            <CheckCircle size={21} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Unpaid
                            </p>
                            <h3 className="mt-1 text-2xl font-bold text-gray-900">
                                {stats.unpaid}
                            </h3>
                        </div>

                        <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                            <Clock size={21} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Paid Revenue
                            </p>
                            <h3 className="mt-1 text-2xl font-bold text-gray-900">
                                {formatCurrency(stats.revenue)}
                            </h3>
                        </div>

                        <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                            <IndianRupee size={21} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Outstanding
                            </p>
                            <h3 className="mt-1 text-2xl font-bold text-gray-900">
                                {formatCurrency(stats.outstanding)}
                            </h3>
                        </div>

                        <div className="rounded-xl bg-red-50 p-3 text-red-600">
                            <Clock size={21} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search invoice, customer..."
                            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gray-400"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                        className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>

                    <select
                        value={paymentFilter}
                        onChange={(e) =>
                            setPaymentFilter(e.target.value)
                        }
                        className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                    >
                        <option value="ALL">All Payments</option>
                        <option value="PAID">Paid</option>
                        <option value="PARTIAL">Partial</option>
                        <option value="UNPAID">Unpaid</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-[1000px] w-full">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Invoice
                                </th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Customer
                                </th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Date
                                </th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Amount
                                </th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Payment
                                </th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Status
                                </th>
                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.map((invoice) => (
                                    <tr
                                        key={invoice.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                                                    <FileText size={17} />
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {
                                                            invoice.invoiceNumber
                                                        }
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {invoice.items.length}{" "}
                                                        item
                                                        {invoice.items.length !==
                                                        1
                                                            ? "s"
                                                            : ""}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="font-medium text-gray-900">
                                                {invoice.customerName ||
                                                    "Walk-in Customer"}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {invoice.customerPhone ||
                                                    invoice.customerEmail ||
                                                    "-"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {invoice.invoiceDate || "-"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-gray-900">
                                                {formatCurrency(
                                                    invoice.grandTotal
                                                )}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            {getPaymentBadge(
                                                invoice.paymentStatus
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            {getStatusBadge(
                                                invoice.status
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/user/invoices/${invoice.id}`}
                                                    className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                                                    title="View Invoice"
                                                >
                                                    <Eye size={17} />
                                                </Link>

                                                <button
                                                    onClick={() =>
                                                        toggleStatus(
                                                            invoice.id
                                                        )
                                                    }
                                                    className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                                                    title={
                                                        String(
                                                            invoice.status
                                                        ).toUpperCase() ===
                                                        "CANCELLED"
                                                            ? "Activate"
                                                            : "Cancel"
                                                    }
                                                >
                                                    {String(
                                                        invoice.status
                                                    ).toUpperCase() ===
                                                    "CANCELLED" ? (
                                                        <CheckCircle
                                                            size={17}
                                                        />
                                                    ) : (
                                                        <XCircle
                                                            size={17}
                                                        />
                                                    )}
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        deleteInvoice(
                                                            invoice.id
                                                        )
                                                    }
                                                    className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-5 py-16 text-center"
                                    >
                                        <div className="mx-auto flex max-w-sm flex-col items-center">
                                            <div className="rounded-2xl bg-gray-100 p-4 text-gray-500">
                                                <FileText size={30} />
                                            </div>

                                            <h3 className="mt-4 font-semibold text-gray-900">
                                                No invoices found
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Create your first invoice
                                                to get started.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Invoice Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Create Invoice
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Create a new customer invoice.
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form
                            onSubmit={handleSaveInvoice}
                            className="overflow-y-auto"
                        >
                            <div className="space-y-6 p-6">
                                {/* Customer */}
                                <div>
                                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">
                                        Customer Details
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Select Customer
                                            </label>

                                            <select
                                                value={form.customerId}
                                                onChange={(e) =>
                                                    handleCustomerChange(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                                            >
                                                <option value="">
                                                    Select customer
                                                </option>

                                                {customers.map(
                                                    (customer) => (
                                                        <option
                                                            key={
                                                                customer.id
                                                            }
                                                            value={
                                                                customer.id
                                                            }
                                                        >
                                                            {customer.name ||
                                                                customer.customerName ||
                                                                customer.fullName}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Customer Name *
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    form.customerName
                                                }
                                                onChange={(e) =>
                                                    updateForm(
                                                        "customerName",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Customer name"
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Phone
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    form.customerPhone
                                                }
                                                onChange={(e) =>
                                                    updateForm(
                                                        "customerPhone",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Customer phone"
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Email
                                            </label>

                                            <input
                                                type="email"
                                                value={
                                                    form.customerEmail
                                                }
                                                onChange={(e) =>
                                                    updateForm(
                                                        "customerEmail",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="customer@email.com"
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Address
                                            </label>

                                            <textarea
                                                value={
                                                    form.customerAddress
                                                }
                                                onChange={(e) =>
                                                    updateForm(
                                                        "customerAddress",
                                                        e.target.value
                                                    )
                                                }
                                                rows="2"
                                                placeholder="Customer address"
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Invoice Details */}
                                <div>
                                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-700">
                                        Invoice Details
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Invoice Date *
                                            </label>

                                            <input
                                                type="date"
                                                value={
                                                    form.invoiceDate
                                                }
                                                onChange={(e) =>
                                                    updateForm(
                                                        "invoiceDate",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Due Date
                                            </label>

                                            <input
                                                type="date"
                                                value={form.dueDate}
                                                onChange={(e) =>
                                                    updateForm(
                                                        "dueDate",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                Payment Status
                                            </label>

                                            <select
                                                value={
                                                    form.paymentStatus
                                                }
                                                onChange={(e) =>
                                                    updateForm(
                                                        "paymentStatus",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                                            >
                                                <option value="UNPAID">
                                                    Unpaid
                                                </option>
                                                <option value="PARTIAL">
                                                    Partial
                                                </option>
                                                <option value="PAID">
                                                    Paid
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Products */}
                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
                                            Products
                                        </h3>

                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800"
                                        >
                                            <Plus size={15} />
                                            Add Product
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {form.items.map(
                                            (item, index) => (
                                                <div
                                                    key={index}
                                                    className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 md:grid-cols-[2fr_1fr_1fr_auto]"
                                                >
                                                    <div>
                                                        <label className="mb-1 block text-xs font-medium text-gray-500">
                                                            Product
                                                        </label>

                                                        <select
                                                            value={
                                                                item.productId
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                handleProductChange(
                                                                    index,
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400"
                                                        >
                                                            <option value="">
                                                                Select
                                                                product
                                                            </option>

                                                            {products.map(
                                                                (
                                                                    product
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            product.id
                                                                        }
                                                                        value={
                                                                            product.id
                                                                        }
                                                                    >
                                                                        {product.name ||
                                                                            product.productName}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="mb-1 block text-xs font-medium text-gray-500">
                                                            Quantity
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={
                                                                item.quantity
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updateItem(
                                                                    index,
                                                                    "quantity",
                                                                    Number(
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-1 block text-xs font-medium text-gray-500">
                                                            Price
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                item.price
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updateItem(
                                                                    index,
                                                                    "price",
                                                                    Number(
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400"
                                                        />
                                                    </div>

                                                    <div className="flex items-end">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeItem(
                                                                    index
                                                                )
                                                            }
                                                            disabled={
                                                                form
                                                                    .items
                                                                    .length ===
                                                                1
                                                            }
                                                            className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            <Trash2
                                                                size={17}
                                                            />
                                                        </button>
                                                    </div>

                                                    <div className="md:col-span-4 text-right text-sm font-semibold text-gray-700">
                                                        Line Total:{" "}
                                                        {formatCurrency(
                                                            Number(
                                                                item.quantity ||
                                                                    0
                                                            ) *
                                                                Number(
                                                                    item.price ||
                                                                        0
                                                                )
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Notes
                                        </label>

                                        <textarea
                                            value={form.notes}
                                            onChange={(e) =>
                                                updateForm(
                                                    "notes",
                                                    e.target.value
                                                )
                                            }
                                            rows="5"
                                            placeholder="Invoice notes..."
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-400"
                                        />
                                    </div>

                                    <div className="rounded-2xl bg-gray-50 p-5">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">
                                                    Subtotal
                                                </span>
                                                <span className="font-semibold">
                                                    {formatCurrency(
                                                        subtotal
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 text-sm">
                                                <span className="text-gray-500">
                                                    Discount
                                                </span>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        form.discount
                                                    }
                                                    onChange={(e) =>
                                                        updateForm(
                                                            "discount",
                                                            Number(
                                                                e.target
                                                                    .value
                                                            )
                                                        )
                                                    }
                                                    className="w-32 rounded-lg border border-gray-200 bg-white px-3 py-2 text-right text-sm outline-none"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between gap-4 text-sm">
                                                <span className="text-gray-500">
                                                    Tax
                                                </span>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={form.tax}
                                                    onChange={(e) =>
                                                        updateForm(
                                                            "tax",
                                                            Number(
                                                                e.target
                                                                    .value
                                                            )
                                                        )
                                                    }
                                                    className="w-32 rounded-lg border border-gray-200 bg-white px-3 py-2 text-right text-sm outline-none"
                                                />
                                            </div>

                                            <div className="border-t border-gray-200 pt-3">
                                                <div className="flex justify-between">
                                                    <span className="font-bold text-gray-900">
                                                        Grand Total
                                                    </span>

                                                    <span className="text-xl font-bold text-gray-900">
                                                        {formatCurrency(
                                                            grandTotal
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Save size={17} />
                                    {saving
                                        ? "Saving..."
                                        : "Create Invoice"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}