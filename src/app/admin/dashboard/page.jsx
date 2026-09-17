"use client";

import {
  Users,
  Building2,
  CreditCard,
  IndianRupee,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";

import {
  demoUsers,
  businesses,
  products,
  sales,
  purchases,
} from "@/data/demoData";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  positive = true,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>

          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon size={21} />
        </div>
      </div>

      {trend && (
        <div
          className={`mt-4 flex items-center gap-1 text-xs font-semibold ${
            positive ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {positive ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}

          {trend}
          <span className="font-normal text-slate-400">
            {" "}
            vs last month
          </span>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const activeUsers = demoUsers.filter(
    (user) => user.status === "ACTIVE"
  ).length;

  const activeBusinesses = businesses.filter(
    (business) => business.status === "ACTIVE"
  ).length;

  const totalRevenue = sales.reduce(
    (sum, sale) => sum + Number(sale.total || 0),
    0
  );

  const totalPurchases = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.total || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) => product.stock <= product.lowStockThreshold
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Overview
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Super Admin Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage businesses, users and platform activity.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
            September 2026
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={demoUsers.length}
          subtitle={`${activeUsers} active users`}
          icon={Users}
          trend="+12.5%"
        />

        <StatCard
          title="Businesses"
          value={businesses.length}
          subtitle={`${activeBusinesses} active businesses`}
          icon={Building2}
          trend="+8.2%"
        />

        <StatCard
          title="Monthly Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          subtitle="Across demo businesses"
          icon={IndianRupee}
          trend="+14.8%"
        />

        <StatCard
          title="Subscriptions"
          value={businesses.length}
          subtitle="Active subscriptions"
          icon={CreditCard}
          trend="+6.4%"
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Platform Revenue
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Sales and purchase overview
              </p>
            </div>

            <div className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
              +14.8%
            </div>
          </div>

          <div className="mt-6 flex h-64 items-end gap-3">
            {[45, 62, 52, 75, 68, 82, 73, 90, 78, 96, 86, 100].map(
              (height, index) => (
                <div
                  key={index}
                  className="group flex h-full flex-1 items-end"
                >
                  <div
                    style={{ height: `${height}%` }}
                    className="w-full rounded-t-lg bg-slate-900 transition group-hover:bg-slate-700"
                  />
                </div>
              )
            )}
          </div>

          <div className="mt-3 flex justify-between text-[11px] text-slate-400">
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Platform Summary
          </h2>

          <div className="mt-5 space-y-4">
            <SummaryRow
              icon={Package}
              label="Total Products"
              value={products.length}
            />

            <SummaryRow
              icon={ShoppingCart}
              label="Total Sales"
              value={sales.length}
            />

            <SummaryRow
              icon={CreditCard}
              label="Total Purchases"
              value={purchases.length}
            />

            <SummaryRow
              icon={AlertTriangle}
              label="Low Stock"
              value={lowStockProducts.length}
              danger
            />
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">
              Purchase Value
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              ₹{totalPurchases.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Businesses */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="font-semibold text-slate-900">
              Recent Businesses
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Recently added platform users
            </p>
          </div>

          <a
            href="/admin/businesses"
            className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900"
          >
            View all
            <ArrowUpRight size={14} />
          </a>
        </div>

        <div className="divide-y divide-slate-100">
          {businesses.slice(0, 5).map((business) => (
            <div
              key={business.id}
              className="flex items-center justify-between gap-4 p-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700">
                  {business.name?.charAt(0)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {business.name}
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    {business.email}
                  </p>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  business.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {business.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  danger = false,
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon size={17} />
        </div>

        <span className="text-sm text-slate-600">{label}</span>
      </div>

      <span
        className={`text-sm font-bold ${
          danger ? "text-red-600" : "text-slate-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}