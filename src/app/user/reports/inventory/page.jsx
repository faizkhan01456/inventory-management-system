"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Search,
    Package,
    IndianRupee,
    AlertTriangle,
    Boxes,
    Printer,
    RefreshCw,
} from "lucide-react";

import { STORAGE_KEYS, getStorage } from "@/lib/storage";

function money(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;
}

function getStock(product) {
    return Number(
        product.stock ||
            product.quantity ||
            product.currentStock ||
            0
    );
}

function getCost(product) {
    return Number(
        product.purchasePrice ||
            product.costPrice ||
            product.buyingPrice ||
            0
    );
}

function getSalePrice(product) {
    return Number(
        product.sellingPrice ||
            product.salePrice ||
            product.price ||
            0
    );
}

export default function InventoryReportPage() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [stockFilter, setStockFilter] =
        useState("ALL");

    function loadData() {
        const data = getStorage(
            STORAGE_KEYS.PRODUCTS,
            []
        );

        setProducts(Array.isArray(data) ? data : []);
    }

    useEffect(() => {
        loadData();
    }, []);

    const filteredProducts = useMemo(() => {
        const query = search.toLowerCase().trim();

        return products.filter((product) => {
            const name =
                product.name ||
                product.productName ||
                "";

            const sku =
                product.sku ||
                product.productCode ||
                "";

            const stock = getStock(product);

            let matchesStock = true;

            if (stockFilter === "IN_STOCK") {
                matchesStock = stock > 0;
            }

            if (stockFilter === "LOW") {
                matchesStock =
                    stock > 0 &&
                    stock <=
                        Number(
                            product.lowStockThreshold ||
                                product.reorderLevel ||
                                10
                        );
            }

            if (stockFilter === "OUT") {
                matchesStock = stock <= 0;
            }

            return (
                (!query ||
                    name
                        .toLowerCase()
                        .includes(query) ||
                    sku
                        .toLowerCase()
                        .includes(query)) &&
                matchesStock
            );
        });
    }, [products, search, stockFilter]);

    const totalUnits = products.reduce(
        (sum, product) =>
            sum + getStock(product),
        0
    );

    const stockValue = products.reduce(
        (sum, product) =>
            sum +
            getStock(product) *
                getCost(product),
        0
    );

    const sellingValue = products.reduce(
        (sum, product) =>
            sum +
            getStock(product) *
                getSalePrice(product),
        0
    );

    const lowStock = products.filter(
        (product) => {
            const stock = getStock(product);

            const threshold = Number(
                product.lowStockThreshold ||
                    product.reorderLevel ||
                    10
            );

            return stock > 0 && stock <= threshold;
        }
    ).length;

    const outOfStock = products.filter(
        (product) => getStock(product) <= 0
    ).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
                <div>
                    <Link
                        href="/user/reports"
                        className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
                    >
                        <ArrowLeft size={16} />
                        Back to Reports
                    </Link>

                    <h1 className="text-2xl font-bold text-gray-900">
                        Inventory Report
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Analyze stock levels and inventory value.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={loadData}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <Printer size={17} />
                        Print
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard
                    title="Products"
                    value={products.length}
                    icon={Package}
                />

                <StatCard
                    title="Stock Units"
                    value={totalUnits}
                    icon={Boxes}
                />

                <StatCard
                    title="Stock Cost Value"
                    value={money(stockValue)}
                    icon={IndianRupee}
                />

                <StatCard
                    title="Selling Value"
                    value={money(sellingValue)}
                    icon={IndianRupee}
                />

                <StatCard
                    title="Low / Out"
                    value={`${lowStock} / ${outOfStock}`}
                    icon={AlertTriangle}
                />
            </div>

            {/* Filters */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm print:hidden">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search product or SKU..."
                            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none"
                        />
                    </div>

                    <select
                        value={stockFilter}
                        onChange={(e) =>
                            setStockFilter(
                                e.target.value
                            )
                        }
                        className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none"
                    >
                        <option value="ALL">
                            All Stock
                        </option>

                        <option value="IN_STOCK">
                            In Stock
                        </option>

                        <option value="LOW">
                            Low Stock
                        </option>

                        <option value="OUT">
                            Out of Stock
                        </option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-[900px] w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                    Product
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                                    Category
                                </th>

                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                                    Stock
                                </th>

                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                                    Cost
                                </th>

                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                                    Stock Value
                                </th>

                                <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                                    Selling Value
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.length ? (
                                filteredProducts.map(
                                    (product, index) => {
                                        const name =
                                            product.name ||
                                            product.productName ||
                                            "Product";

                                        const category =
                                            product.categoryName ||
                                            product.category?.name ||
                                            product.category ||
                                            "-";

                                        const stock =
                                            getStock(
                                                product
                                            );

                                        const cost =
                                            getCost(
                                                product
                                            );

                                        const salePrice =
                                            getSalePrice(
                                                product
                                            );

                                        const threshold =
                                            Number(
                                                product.lowStockThreshold ||
                                                    product.reorderLevel ||
                                                    10
                                            );

                                        let badge =
                                            "In Stock";

                                        if (
                                            stock <= 0
                                        ) {
                                            badge =
                                                "Out of Stock";
                                        } else if (
                                            stock <=
                                            threshold
                                        ) {
                                            badge =
                                                "Low Stock";
                                        }

                                        return (
                                            <tr
                                                key={
                                                    product.id ||
                                                    index
                                                }
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-gray-900">
                                                        {name}
                                                    </p>

                                                    <p className="text-xs text-gray-400">
                                                        {product.sku ||
                                                            product.productCode ||
                                                            "-"}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-600">
                                                    {category}
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    <p className="font-semibold text-gray-900">
                                                        {stock.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </p>

                                                    <span
                                                        className={`text-xs font-medium ${
                                                            stock <=
                                                            0
                                                                ? "text-red-600"
                                                                : stock <=
                                                                  threshold
                                                                ? "text-amber-600"
                                                                : "text-emerald-600"
                                                        }`}
                                                    >
                                                        {badge}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-right text-sm text-gray-600">
                                                    {money(
                                                        cost
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-right font-semibold text-gray-900">
                                                    {money(
                                                        stock *
                                                            cost
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-right font-semibold text-gray-900">
                                                    {money(
                                                        stock *
                                                            salePrice
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    }
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-5 py-16 text-center text-sm text-gray-500"
                                    >
                                        No products found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    .print\\:hidden {
                        display: none !important;
                    }

                    body {
                        background: white !important;
                    }
                }
            `}</style>
        </div>
    );
}

function StatCard({ title, value, icon: Icon }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">
                        {title}
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-gray-900">
                        {typeof value === "number"
                            ? value.toLocaleString("en-IN")
                            : value}
                    </h2>
                </div>

                <div className="rounded-xl bg-gray-100 p-3 text-gray-700">
                    <Icon size={21} />
                </div>
            </div>
        </div>
    );
}