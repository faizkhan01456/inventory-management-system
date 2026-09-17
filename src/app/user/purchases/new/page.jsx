"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Plus,
    Trash2,
    ShoppingCart,
    Save,
    Package,
    Truck,
    Calculator,
    X,
} from "lucide-react";

import {
    getStorage,
    setStorage,
    STORAGE_KEYS,
} from "@/lib/storage";

const generateId = (prefix) => {
    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;
};

export default function NewPurchasePage() {
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);

    const [supplierId, setSupplierId] = useState("");
    const [invoiceNumber, setInvoiceNumber] =
        useState("");

    const [purchaseDate, setPurchaseDate] =
        useState(
            new Date()
                .toISOString()
                .split("T")[0]
        );

    const [paymentMethod, setPaymentMethod] =
        useState("CASH");

    const [discount, setDiscount] =
        useState(0);

    const [tax, setTax] = useState(0);

    const [notes, setNotes] = useState("");

    const [items, setItems] = useState([]);

    const [selectedProduct, setSelectedProduct] =
        useState("");

    const [selectedQuantity, setSelectedQuantity] =
        useState(1);

    const [selectedPrice, setSelectedPrice] =
        useState("");

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const storedSuppliers =
            getStorage(
                STORAGE_KEYS.SUPPLIERS,
                []
            );

        const storedProducts =
            getStorage(
                STORAGE_KEYS.PRODUCTS,
                []
            );

        setSuppliers(
            Array.isArray(storedSuppliers)
                ? storedSuppliers
                : []
        );

        setProducts(
            Array.isArray(storedProducts)
                ? storedProducts
                : []
        );
    };

    /*
     * ========================================
     * SELECTED PRODUCT
     * ========================================
     */

    const currentProduct = useMemo(() => {
        return products.find(
            (product) =>
                String(product.id) ===
                String(selectedProduct)
        );
    }, [
        products,
        selectedProduct,
    ]);

    /*
     * ========================================
     * PRODUCT CHANGE
     * ========================================
     */

    const handleProductChange = (productId) => {
        setSelectedProduct(productId);

        const product = products.find(
            (item) =>
                String(item.id) ===
                String(productId)
        );

        if (product) {
            setSelectedPrice(
                Number(
                    product.purchasePrice ||
                        0
                )
            );
        } else {
            setSelectedPrice("");
        }
    };

    /*
     * ========================================
     * ADD ITEM
     * ========================================
     */

    const addItem = () => {
        if (!selectedProduct) {
            alert("Please select a product.");
            return;
        }

        const quantity = Number(
            selectedQuantity
        );

        const purchasePrice = Number(
            selectedPrice
        );

        if (
            !quantity ||
            quantity <= 0
        ) {
            alert(
                "Please enter a valid quantity."
            );
            return;
        }

        if (
            purchasePrice < 0 ||
            Number.isNaN(purchasePrice)
        ) {
            alert(
                "Please enter a valid purchase price."
            );
            return;
        }

        const product = products.find(
            (item) =>
                String(item.id) ===
                String(selectedProduct)
        );

        if (!product) {
            alert("Product not found.");
            return;
        }

        const existingIndex =
            items.findIndex(
                (item) =>
                    String(item.productId) ===
                    String(selectedProduct)
            );

        if (existingIndex !== -1) {
            const updatedItems = [
                ...items,
            ];

            updatedItems[
                existingIndex
            ] = {
                ...updatedItems[
                    existingIndex
                ],
                quantity:
                    Number(
                        updatedItems[
                            existingIndex
                        ].quantity
                    ) + quantity,
                purchasePrice,
                total:
                    (Number(
                        updatedItems[
                            existingIndex
                        ].quantity
                    ) + quantity) *
                    purchasePrice,
            };

            setItems(updatedItems);
        } else {
            setItems([
                ...items,
                {
                    id: generateId("purchase_item"),
                    productId:
                        product.id,
                    productName:
                        product.name,
                    sku:
                        product.sku ||
                        "",
                    unit:
                        product.unit ||
                        "pcs",
                    quantity,
                    purchasePrice,
                    total:
                        quantity *
                        purchasePrice,
                },
            ]);
        }

        setSelectedProduct("");
        setSelectedQuantity(1);
        setSelectedPrice("");
    };

    /*
     * ========================================
     * REMOVE ITEM
     * ========================================
     */

    const removeItem = (itemId) => {
        setItems(
            items.filter(
                (item) =>
                    item.id !== itemId
            )
        );
    };

    /*
     * ========================================
     * UPDATE ITEM
     * ========================================
     */

    const updateItem = (
        itemId,
        field,
        value
    ) => {
        setItems((previous) =>
            previous.map((item) => {
                if (
                    item.id !== itemId
                ) {
                    return item;
                }

                const updated = {
                    ...item,
                    [field]:
                        field ===
                            "quantity" ||
                        field ===
                            "purchasePrice"
                            ? Number(
                                  value
                              )
                            : value,
                };

                updated.total =
                    Number(
                        updated.quantity
                    ) *
                    Number(
                        updated.purchasePrice
                    );

                return updated;
            })
        );
    };

    /*
     * ========================================
     * CALCULATIONS
     * ========================================
     */

    const subtotal = useMemo(() => {
        return items.reduce(
            (total, item) =>
                total +
                Number(
                    item.total || 0
                ),
            0
        );
    }, [items]);

    const discountAmount =
        Number(discount) || 0;

    const taxableAmount =
        Math.max(
            subtotal -
                discountAmount,
            0
        );

    const taxAmount =
        (taxableAmount *
            (Number(tax) || 0)) /
        100;

    const grandTotal =
        taxableAmount +
        taxAmount;

    /*
     * ========================================
     * SAVE PURCHASE
     * ========================================
     */

    const handleSavePurchase = () => {
        if (!supplierId) {
            alert(
                "Please select a supplier."
            );
            return;
        }

        if (items.length === 0) {
            alert(
                "Please add at least one product."
            );
            return;
        }

        if (!purchaseDate) {
            alert(
                "Please select purchase date."
            );
            return;
        }

        setSaving(true);

        try {
            const supplier =
                suppliers.find(
                    (item) =>
                        String(
                            item.id
                        ) ===
                        String(
                            supplierId
                        )
                );

            const existingPurchases =
                getStorage(
                    STORAGE_KEYS.PURCHASES,
                    []
                );

            const existingProducts =
                getStorage(
                    STORAGE_KEYS.PRODUCTS,
                    []
                );

            const purchaseId =
                generateId(
                    "purchase"
                );

            const purchaseNumber =
                `PUR-${Date.now()
                    .toString()
                    .slice(-8)}`;

            /*
             * Update Product Stock
             */

            const updatedProducts =
                existingProducts.map(
                    (product) => {
                        const purchaseItem =
                            items.find(
                                (item) =>
                                    String(
                                        item.productId
                                    ) ===
                                    String(
                                        product.id
                                    )
                            );

                        if (
                            !purchaseItem
                        ) {
                            return product;
                        }

                        const oldStock =
                            Number(
                                product.stock ||
                                    0
                            );

                        const addedStock =
                            Number(
                                purchaseItem.quantity ||
                                    0
                            );

                        return {
                            ...product,
                            stock:
                                oldStock +
                                addedStock,
                            purchasePrice:
                                Number(
                                    purchaseItem.purchasePrice ||
                                        product.purchasePrice ||
                                        0
                                ),
                            updatedAt:
                                new Date().toISOString(),
                        };
                    }
                );

            /*
             * Purchase Object
             */

            const purchase = {
                id: purchaseId,

                purchaseNumber,

                invoiceNumber:
                    invoiceNumber.trim() ||
                    purchaseNumber,

                supplierId:
                    supplier?.id ||
                    supplierId,

                supplierName:
                    supplier?.name ||
                    supplier?.companyName ||
                    supplier?.businessName ||
                    "Unknown Supplier",

                supplierPhone:
                    supplier?.phone ||
                    "",

                supplierEmail:
                    supplier?.email ||
                    "",

                purchaseDate,

                items,

                subtotal,

                discount:
                    discountAmount,

                tax:
                    Number(tax) || 0,

                taxAmount,

                grandTotal,

                paymentMethod,

                paymentStatus:
                    "PAID",

                status:
                    "COMPLETED",

                notes:
                    notes.trim(),

                createdAt:
                    new Date().toISOString(),

                updatedAt:
                    new Date().toISOString(),
            };

            /*
             * Save Purchase
             */

            setStorage(
                STORAGE_KEYS.PURCHASES,
                [
                    purchase,
                    ...(Array.isArray(
                        existingPurchases
                    )
                        ? existingPurchases
                        : []),
                ]
            );

            /*
             * Save Updated Products
             */

            setStorage(
                STORAGE_KEYS.PRODUCTS,
                updatedProducts
            );

            alert(
                `Purchase created successfully!\n\nPurchase: ${purchaseNumber}\nTotal: ₹${grandTotal.toLocaleString(
                    "en-IN"
                )}\n\nInventory stock has been updated.`
            );

            window.location.href =
                "/user/purchases";
        } catch (error) {
            console.error(
                "Purchase save error:",
                error
            );

            alert(
                "Something went wrong while saving purchase."
            );

            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">

            {/* HEADER */}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div className="flex items-center gap-3">

                    <Link
                        href="/user/purchases"
                        className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <div>

                        <div className="flex items-center gap-2">

                            <ShoppingCart
                                size={24}
                                className="text-slate-700"
                            />

                            <h1 className="text-2xl font-bold text-slate-900">
                                New Purchase
                            </h1>

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Create a new supplier
                            purchase.
                        </p>

                    </div>

                </div>

            </div>

            {/* PURCHASE INFORMATION */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                    <div className="flex items-center gap-2">

                        <Truck
                            size={20}
                            className="text-slate-600"
                        />

                        <h2 className="font-bold text-slate-900">
                            Purchase Information
                        </h2>

                    </div>

                </div>

                <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-4">

                    {/* SUPPLIER */}

                    <div className="lg:col-span-2">

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Supplier *
                        </label>

                        <select
                            value={supplierId}
                            onChange={(e) =>
                                setSupplierId(
                                    e.target.value
                                )
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                        >

                            <option value="">
                                Select Supplier
                            </option>

                            {suppliers.map(
                                (supplier) => (
                                    <option
                                        key={
                                            supplier.id
                                        }
                                        value={
                                            supplier.id
                                        }
                                    >
                                        {supplier.name ||
                                            supplier.companyName ||
                                            supplier.businessName ||
                                            "Supplier"}
                                    </option>
                                )
                            )}

                        </select>

                        {suppliers.length ===
                            0 && (
                            <p className="mt-2 text-xs text-amber-600">
                                No suppliers found.
                                Please add a supplier
                                first.
                            </p>
                        )}

                    </div>

                    {/* INVOICE */}

                    <div>

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Invoice Number
                        </label>

                        <input
                            type="text"
                            value={
                                invoiceNumber
                            }
                            onChange={(e) =>
                                setInvoiceNumber(
                                    e.target.value
                                )
                            }
                            placeholder="Supplier invoice no."
                            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                        />

                    </div>

                    {/* DATE */}

                    <div>

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Purchase Date *
                        </label>

                        <input
                            type="date"
                            value={
                                purchaseDate
                            }
                            onChange={(e) =>
                                setPurchaseDate(
                                    e.target.value
                                )
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                        />

                    </div>

                </div>

            </div>

            {/* ADD PRODUCTS */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                    <div className="flex items-center gap-2">

                        <Package
                            size={20}
                            className="text-slate-600"
                        />

                        <h2 className="font-bold text-slate-900">
                            Add Products
                        </h2>

                    </div>

                </div>

                <div className="grid gap-4 p-6 md:grid-cols-12">

                    {/* PRODUCT */}

                    <div className="md:col-span-5">

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Product
                        </label>

                        <select
                            value={
                                selectedProduct
                            }
                            onChange={(e) =>
                                handleProductChange(
                                    e.target
                                        .value
                                )
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                        >

                            <option value="">
                                Select Product
                            </option>

                            {products.map(
                                (product) => (
                                    <option
                                        key={
                                            product.id
                                        }
                                        value={
                                            product.id
                                        }
                                    >
                                        {product.name}
                                        {product.sku
                                            ? ` (${product.sku})`
                                            : ""}
                                    </option>
                                )
                            )}

                        </select>

                    </div>

                    {/* QUANTITY */}

                    <div className="md:col-span-2">

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Quantity
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={
                                selectedQuantity
                            }
                            onChange={(e) =>
                                setSelectedQuantity(
                                    e.target
                                        .value
                                )
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                        />

                    </div>

                    {/* PRICE */}

                    <div className="md:col-span-3">

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Purchase Price
                        </label>

                        <input
                            type="number"
                            min="0"
                            value={
                                selectedPrice
                            }
                            onChange={(e) =>
                                setSelectedPrice(
                                    e.target
                                        .value
                                )
                            }
                            placeholder="0.00"
                            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                        />

                    </div>

                    {/* ADD */}

                    <div className="flex items-end md:col-span-2">

                        <button
                            type="button"
                            onClick={addItem}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            <Plus size={17} />
                            Add
                        </button>

                    </div>

                </div>

                {currentProduct && (
                    <div className="mx-6 mb-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">

                        Current Stock:{" "}
                        <strong className="text-slate-700">
                            {Number(
                                currentProduct.stock ||
                                    0
                            )}{" "}
                            {currentProduct.unit ||
                                "pcs"}
                        </strong>

                    </div>
                )}

            </div>

            {/* ITEMS TABLE */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                    <h2 className="font-bold text-slate-900">
                        Purchase Items
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                        {items.length} product
                        {items.length !== 1
                            ? "s"
                            : ""} added
                    </p>

                </div>

                {items.length === 0 ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center text-center">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                            <Package
                                size={25}
                                className="text-slate-400"
                            />
                        </div>

                        <p className="mt-3 text-sm font-semibold text-slate-600">
                            No products added
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Select a product above
                            to add it.
                        </p>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[800px]">

                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        PRODUCT
                                    </th>

                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500">
                                        SKU
                                    </th>

                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-500">
                                        QTY
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        PRICE
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        TOTAL
                                    </th>

                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                                        ACTION
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {items.map(
                                    (item) => (
                                        <tr
                                            key={
                                                item.id
                                            }
                                            className="border-b border-slate-100 last:border-0"
                                        >

                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-slate-800">
                                                    {
                                                        item.productName
                                                    }
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="text-xs text-slate-500">
                                                    {item.sku ||
                                                        "—"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">

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
                                                            item.id,
                                                            "quantity",
                                                            e.target
                                                                .value
                                                        )
                                                    }
                                                    className="h-9 w-20 rounded-lg border border-slate-200 px-2 text-center text-sm outline-none focus:border-slate-400"
                                                />

                                            </td>

                                            <td className="px-6 py-4">

                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        item.purchasePrice
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        updateItem(
                                                            item.id,
                                                            "purchasePrice",
                                                            e.target
                                                                .value
                                                        )
                                                    }
                                                    className="h-9 w-28 rounded-lg border border-slate-200 px-2 text-right text-sm outline-none focus:border-slate-400"
                                                />

                                            </td>

                                            <td className="px-6 py-4 text-right">

                                                <span className="text-sm font-bold text-slate-900">
                                                    ₹
                                                    {Number(
                                                        item.total ||
                                                            0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </span>

                                            </td>

                                            <td className="px-6 py-4 text-right">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeItem(
                                                            item.id
                                                        )
                                                    }
                                                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                    title="Remove"
                                                >
                                                    <Trash2
                                                        size={
                                                            17
                                                        }
                                                    />
                                                </button>

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {/* BOTTOM SECTION */}

            <div className="grid gap-6 lg:grid-cols-2">

                {/* NOTES + PAYMENT */}

                <div className="space-y-6">

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h2 className="font-bold text-slate-900">
                            Payment
                        </h2>

                        <div className="mt-5">

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Payment Method
                            </label>

                            <select
                                value={
                                    paymentMethod
                                }
                                onChange={(e) =>
                                    setPaymentMethod(
                                        e.target
                                            .value
                                    )
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                            >

                                <option value="CASH">
                                    Cash
                                </option>

                                <option value="BANK_TRANSFER">
                                    Bank Transfer
                                </option>

                                <option value="UPI">
                                    UPI
                                </option>

                                <option value="CARD">
                                    Card
                                </option>

                                <option value="CREDIT">
                                    Credit
                                </option>

                            </select>

                        </div>

                        <div className="mt-5">

                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Notes
                            </label>

                            <textarea
                                value={notes}
                                onChange={(e) =>
                                    setNotes(
                                        e.target
                                            .value
                                    )
                                }
                                rows={4}
                                placeholder="Add purchase notes..."
                                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                            />

                        </div>

                    </div>

                </div>

                {/* TOTAL */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-2">

                        <Calculator
                            size={20}
                            className="text-slate-600"
                        />

                        <h2 className="font-bold text-slate-900">
                            Purchase Summary
                        </h2>

                    </div>

                    <div className="mt-6 space-y-4">

                        <div className="flex justify-between text-sm">

                            <span className="text-slate-500">
                                Subtotal
                            </span>

                            <span className="font-semibold text-slate-800">
                                ₹
                                {subtotal.toLocaleString(
                                    "en-IN"
                                )}
                            </span>

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-600">
                                Discount
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={
                                    discount
                                }
                                onChange={(e) =>
                                    setDiscount(
                                        e.target
                                            .value
                                    )
                                }
                                className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-600">
                                Tax (%)
                            </label>

                            <input
                                type="number"
                                min="0"
                                value={tax}
                                onChange={(e) =>
                                    setTax(
                                        e.target
                                            .value
                                    )
                                }
                                className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                            />

                        </div>

                        <div className="flex justify-between text-sm">

                            <span className="text-slate-500">
                                Tax Amount
                            </span>

                            <span className="font-semibold text-slate-800">
                                ₹
                                {taxAmount.toLocaleString(
                                    "en-IN"
                                )}
                            </span>

                        </div>

                        <div className="border-t border-slate-200 pt-4">

                            <div className="flex items-center justify-between">

                                <span className="text-base font-bold text-slate-900">
                                    Grand Total
                                </span>

                                <span className="text-2xl font-bold text-slate-900">
                                    ₹
                                    {grandTotal.toLocaleString(
                                        "en-IN"
                                    )}
                                </span>

                            </div>

                        </div>

                        <button
                            type="button"
                            disabled={
                                saving ||
                                items.length ===
                                    0 ||
                                !supplierId
                            }
                            onClick={
                                handleSavePurchase
                            }
                            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            <Save size={18} />

                            {saving
                                ? "Saving..."
                                : "Save Purchase"}

                        </button>

                        <Link
                            href="/user/purchases"
                            className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            Cancel
                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
}