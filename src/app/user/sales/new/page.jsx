"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Plus,
    Trash2,
    ShoppingBag,
    Save,
    Package,
    User,
    Calculator,
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

export default function NewSalePage() {
    const [customers, setCustomers] =
        useState([]);

    const [products, setProducts] =
        useState([]);

    const [customerId, setCustomerId] =
        useState("");

    const [invoiceNumber, setInvoiceNumber] =
        useState("");

    const [saleDate, setSaleDate] =
        useState(
            new Date()
                .toISOString()
                .split("T")[0]
        );

    const [paymentMethod, setPaymentMethod] =
        useState("CASH");

    const [discount, setDiscount] =
        useState(0);

    const [tax, setTax] =
        useState(0);

    const [notes, setNotes] =
        useState("");

    const [items, setItems] =
        useState([]);

    const [selectedProduct, setSelectedProduct] =
        useState("");

    const [selectedQuantity, setSelectedQuantity] =
        useState(1);

    const [selectedPrice, setSelectedPrice] =
        useState("");

    const [saving, setSaving] =
        useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const storedCustomers =
            getStorage(
                STORAGE_KEYS.CUSTOMERS,
                []
            );

        const storedProducts =
            getStorage(
                STORAGE_KEYS.PRODUCTS,
                []
            );

        setCustomers(
            Array.isArray(
                storedCustomers
            )
                ? storedCustomers
                : []
        );

        setProducts(
            Array.isArray(
                storedProducts
            )
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

    const handleProductChange = (
        productId
    ) => {
        setSelectedProduct(
            productId
        );

        const product =
            products.find(
                (item) =>
                    String(
                        item.id
                    ) ===
                    String(
                        productId
                    )
            );

        if (product) {
            setSelectedPrice(
                Number(
                    product.sellingPrice ||
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
            alert(
                "Please select a product."
            );
            return;
        }

        const quantity =
            Number(
                selectedQuantity
            );

        const sellingPrice =
            Number(
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
            sellingPrice < 0 ||
            Number.isNaN(
                sellingPrice
            )
        ) {
            alert(
                "Please enter a valid selling price."
            );
            return;
        }

        const product =
            products.find(
                (item) =>
                    String(
                        item.id
                    ) ===
                    String(
                        selectedProduct
                    )
            );

        if (!product) {
            alert(
                "Product not found."
            );
            return;
        }

        const availableStock =
            Number(
                product.stock || 0
            );

        const existingItem =
            items.find(
                (item) =>
                    String(
                        item.productId
                    ) ===
                    String(
                        selectedProduct
                    )
            );

        const existingQuantity =
            existingItem
                ? Number(
                      existingItem.quantity ||
                          0
                  )
                : 0;

        if (
            existingQuantity +
                quantity >
            availableStock
        ) {
            alert(
                `Insufficient stock.\n\nAvailable stock: ${availableStock}\nRequested quantity: ${
                    existingQuantity +
                    quantity
                }`
            );

            return;
        }

        const existingIndex =
            items.findIndex(
                (item) =>
                    String(
                        item.productId
                    ) ===
                    String(
                        selectedProduct
                    )
            );

        if (
            existingIndex !==
            -1
        ) {
            const updatedItems =
                [...items];

            const newQuantity =
                Number(
                    updatedItems[
                        existingIndex
                    ].quantity
                ) + quantity;

            updatedItems[
                existingIndex
            ] = {
                ...updatedItems[
                    existingIndex
                ],
                quantity:
                    newQuantity,
                sellingPrice,
                total:
                    newQuantity *
                    sellingPrice,
            };

            setItems(
                updatedItems
            );
        } else {
            setItems([
                ...items,
                {
                    id: generateId(
                        "sale_item"
                    ),

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

                    sellingPrice,

                    total:
                        quantity *
                        sellingPrice,
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

    const removeItem = (
        itemId
    ) => {
        setItems(
            items.filter(
                (item) =>
                    item.id !==
                    itemId
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
        setItems(
            (previous) =>
                previous.map(
                    (item) => {
                        if (
                            item.id !==
                            itemId
                        ) {
                            return item;
                        }

                        const updated =
                            {
                                ...item,
                                [field]:
                                    field ===
                                        "quantity" ||
                                    field ===
                                        "sellingPrice"
                                        ? Number(
                                              value
                                          )
                                        : value,
                            };

                        const product =
                            products.find(
                                (
                                    product
                                ) =>
                                    String(
                                        product.id
                                    ) ===
                                    String(
                                        item.productId
                                    )
                            );

                        if (
                            field ===
                            "quantity"
                        ) {
                            const availableStock =
                                Number(
                                    product?.stock ||
                                        0
                                );

                            if (
                                Number(
                                    value
                                ) >
                                availableStock
                            ) {
                                alert(
                                    `Available stock is ${availableStock}.`
                                );

                                updated.quantity =
                                    availableStock;
                            }
                        }

                        updated.total =
                            Number(
                                updated.quantity ||
                                    0
                            ) *
                            Number(
                                updated.sellingPrice ||
                                    0
                            );

                        return updated;
                    }
                )
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
        Number(
            discount
        ) || 0;

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
     * SAVE SALE
     * ========================================
     */

    const handleSaveSale = () => {
        if (items.length === 0) {
            alert(
                "Please add at least one product."
            );
            return;
        }

        if (!saleDate) {
            alert(
                "Please select sale date."
            );
            return;
        }

        setSaving(true);

        try {
            const existingSales =
                getStorage(
                    STORAGE_KEYS.SALES,
                    []
                );

            const existingProducts =
                getStorage(
                    STORAGE_KEYS.PRODUCTS,
                    []
                );

            /*
             * CUSTOMER
             */

            const customer =
                customers.find(
                    (item) =>
                        String(
                            item.id
                        ) ===
                        String(
                            customerId
                        )
                );

            /*
             * FINAL STOCK VALIDATION
             */

            for (
                const saleItem of items
            ) {
                const product =
                    existingProducts.find(
                        (item) =>
                            String(
                                item.id
                            ) ===
                            String(
                                saleItem.productId
                            )
                    );

                if (!product) {
                    throw new Error(
                        `Product "${saleItem.productName}" not found.`
                    );
                }

                const stock =
                    Number(
                        product.stock ||
                            0
                    );

                const quantity =
                    Number(
                        saleItem.quantity ||
                            0
                    );

                if (
                    quantity <= 0
                ) {
                    throw new Error(
                        `Invalid quantity for ${saleItem.productName}.`
                    );
                }

                if (
                    quantity >
                    stock
                ) {
                    throw new Error(
                        `Insufficient stock for ${saleItem.productName}. Available: ${stock}`
                    );
                }
            }

            /*
             * UPDATE STOCK
             */

            const updatedProducts =
                existingProducts.map(
                    (product) => {
                        const saleItem =
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
                            !saleItem
                        ) {
                            return product;
                        }

                        const currentStock =
                            Number(
                                product.stock ||
                                    0
                            );

                        const soldQuantity =
                            Number(
                                saleItem.quantity ||
                                    0
                            );

                        return {
                            ...product,

                            stock:
                                currentStock -
                                soldQuantity,

                            updatedAt:
                                new Date().toISOString(),
                        };
                    }
                );

            /*
             * SALE ID
             */

            const saleId =
                generateId(
                    "sale"
                );

            const saleNumber =
                `SALE-${Date.now()
                    .toString()
                    .slice(-8)}`;

            /*
             * SALE OBJECT
             */

            const sale = {
                id: saleId,

                saleNumber,

                invoiceNumber:
                    invoiceNumber.trim() ||
                    saleNumber,

                customerId:
                    customer?.id ||
                    customerId ||
                    null,

                customerName:
                    customer?.name ||
                    customer?.customerName ||
                    customer?.companyName ||
                    "Walk-in Customer",

                customerPhone:
                    customer?.phone ||
                    customer?.mobile ||
                    "",

                customerEmail:
                    customer?.email ||
                    "",

                saleDate,

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
                    paymentMethod ===
                    "CREDIT"
                        ? "PENDING"
                        : "PAID",

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
             * SAVE SALE
             */

            setStorage(
                STORAGE_KEYS.SALES,
                [
                    sale,
                    ...(Array.isArray(
                        existingSales
                    )
                        ? existingSales
                        : []),
                ]
            );

            /*
             * SAVE UPDATED PRODUCTS
             */

            setStorage(
                STORAGE_KEYS.PRODUCTS,
                updatedProducts
            );

            alert(
                `Sale created successfully!\n\nSale: ${saleNumber}\nTotal: ₹${grandTotal.toLocaleString(
                    "en-IN"
                )}\n\nProduct stock has been reduced.`
            );

            window.location.href =
                "/user/sales";
        } catch (error) {
            console.error(
                "Sale save error:",
                error
            );

            alert(
                error.message ||
                    "Something went wrong while saving sale."
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
                        href="/user/sales"
                        className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50"
                    >
                        <ArrowLeft size={20} />
                    </Link>

                    <div>

                        <div className="flex items-center gap-2">

                            <ShoppingBag
                                size={24}
                                className="text-slate-700"
                            />

                            <h1 className="text-2xl font-bold text-slate-900">
                                New Sale
                            </h1>

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Create a new customer
                            sale.
                        </p>

                    </div>

                </div>

            </div>

            {/* SALE INFORMATION */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                    <div className="flex items-center gap-2">

                        <User
                            size={20}
                            className="text-slate-600"
                        />

                        <h2 className="font-bold text-slate-900">
                            Sale Information
                        </h2>

                    </div>

                </div>

                <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-4">

                    {/* CUSTOMER */}

                    <div className="lg:col-span-2">

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Customer
                        </label>

                        <select
                            value={
                                customerId
                            }
                            onChange={(e) =>
                                setCustomerId(
                                    e.target.value
                                )
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                        >

                            <option value="">
                                Walk-in Customer
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
                                            customer.companyName ||
                                            "Customer"}
                                    </option>
                                )
                            )}

                        </select>

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
                            placeholder="Auto generated"
                            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                        />

                    </div>

                    {/* DATE */}

                    <div>

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Sale Date *
                        </label>

                        <input
                            type="date"
                            value={
                                saleDate
                            }
                            onChange={(e) =>
                                setSaleDate(
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
                                    e.target.value
                                )
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                        >

                            <option value="">
                                Select Product
                            </option>

                            {products.map(
                                (product) => {

                                    const stock =
                                        Number(
                                            product.stock ||
                                                0
                                        );

                                    return (
                                        <option
                                            key={
                                                product.id
                                            }
                                            value={
                                                product.id
                                            }
                                            disabled={
                                                stock <=
                                                0
                                            }
                                        >
                                            {product.name}
                                            {product.sku
                                                ? ` (${product.sku})`
                                                : ""}
                                            {` - Stock: ${stock}`}
                                        </option>
                                    );
                                }
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
                                    e.target.value
                                )
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                        />

                    </div>

                    {/* PRICE */}

                    <div className="md:col-span-3">

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Selling Price
                        </label>

                        <input
                            type="number"
                            min="0"
                            value={
                                selectedPrice
                            }
                            onChange={(e) =>
                                setSelectedPrice(
                                    e.target.value
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

                        Available Stock:{" "}

                        <strong className="text-slate-700">
                            {Number(
                                currentProduct.stock ||
                                    0
                            )}{" "}
                            {currentProduct.unit ||
                                "pcs"}
                        </strong>

                        <span className="mx-2">
                            |
                        </span>

                        Selling Price:{" "}

                        <strong className="text-slate-700">
                            ₹
                            {Number(
                                currentProduct.sellingPrice ||
                                    0
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </strong>

                    </div>
                )}

            </div>

            {/* ITEMS */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-6 py-5">

                    <h2 className="font-bold text-slate-900">
                        Sale Items
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
                                                        item.sellingPrice
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        updateItem(
                                                            item.id,
                                                            "sellingPrice",
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

            {/* BOTTOM */}

            <div className="grid gap-6 lg:grid-cols-2">

                {/* PAYMENT */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <h2 className="font-bold text-slate-900">
                        Payment & Notes
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
                                    e.target.value
                                )
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                        >

                            <option value="CASH">
                                Cash
                            </option>

                            <option value="UPI">
                                UPI
                            </option>

                            <option value="CARD">
                                Card
                            </option>

                            <option value="BANK_TRANSFER">
                                Bank Transfer
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
                                    e.target.value
                                )
                            }
                            rows={5}
                            placeholder="Add sale notes..."
                            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                        />

                    </div>

                </div>

                {/* SUMMARY */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-2">

                        <Calculator
                            size={20}
                            className="text-slate-600"
                        />

                        <h2 className="font-bold text-slate-900">
                            Sale Summary
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
                                        e.target.value
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
                                        e.target.value
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
                                    0
                            }
                            onClick={
                                handleSaveSale
                            }
                            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            <Save size={18} />

                            {saving
                                ? "Saving..."
                                : "Save Sale"}

                        </button>

                        <Link
                            href="/user/sales"
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