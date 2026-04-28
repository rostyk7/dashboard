"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listOrders, cancelOrder } from "@/lib/api";
import type { OrderStatus } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import CreateOrderModal from "@/components/CreateOrderModal";
import StatsBar from "@/components/StatsBar";
import { StatsBarSkeleton, OrdersTableSkeleton } from "@/components/Skeleton";

type Tab = { label: string; status?: OrderStatus };

const TABS: Tab[] = [
  { label: "All" },
  { label: "Review", status: "REVIEW" },
  { label: "Active", status: "AWAITING_PAYMENT" },
  { label: "Paid", status: "PAID" },
  { label: "Failed", status: "PAYMENT_FAILED" },
];

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersContent />
    </Suspense>
  );
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const statusParam = searchParams.get("status") as OrderStatus | null;
  const activeTab = TABS.find((t) => t.status === statusParam) ?? TABS[0];
  const [showCreate, setShowCreate] = useState(false);

  const tableKey = activeTab.status ?? "all";

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", tableKey],
    queryFn: () => listOrders(activeTab.status),
    refetchInterval: 5000,
  });

  // Always fetch all orders for stats — React Query deduplicates when on "All" tab
  const { data: allData, isLoading: statsLoading } = useQuery({
    queryKey: ["orders", "all"],
    queryFn: () => listOrders(),
    refetchInterval: 5000,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const orders = data?.orders ?? [];
  const allOrders = allData?.orders ?? [];
  const allTotal = allData?.total ?? 0;
  const reviewCount = allOrders.filter((o) => o.status === "REVIEW").length;

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{allTotal} total</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          + New Order
        </button>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <StatsBarSkeleton />
      ) : (
        <StatsBar orders={allOrders} total={allTotal} />
      )}

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Filter orders by status"
        className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto"
      >
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab.label}
              role="tab"
              aria-selected={isActive}
              onClick={() =>
                router.push(tab.status ? `/orders?status=${tab.status}` : "/orders")
              }
              className={`relative px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "text-slate-900 border-b-2 border-slate-900 -mb-px"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.status === "REVIEW" && reviewCount > 0 && (
                <span
                  aria-label={`${reviewCount} orders under review`}
                  className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] font-bold"
                >
                  {reviewCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
          {(error as Error).message} — is order-service running?
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <OrdersTableSkeleton />
      ) : orders.length === 0 ? (
        <p className="text-sm text-gray-400 py-12 text-center">No orders yet.</p>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-x-auto bg-white">
          <table className="w-full text-sm min-w-[580px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500 w-36">Order ID</th>
                <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Customer</th>
                <th scope="col" className="text-right px-4 py-3 font-medium text-gray-500">Amount</th>
                <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th scope="col" className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Created</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    <Link
                      href={`/orders/${order.id}`}
                      className="hover:text-slate-900 hover:underline"
                    >
                      {order.id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700 hidden sm:table-cell">{order.customer_email}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatAmount(order.amount, order.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3 flex gap-2 justify-end">
                    <Link
                      href={`/orders/${order.id}`}
                      aria-label={`View order ${order.id.slice(0, 8)}`}
                      className="text-xs text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline"
                    >
                      View
                    </Link>
                    {["PENDING", "AWAITING_PAYMENT", "PAYMENT_FAILED"].includes(order.status) && (
                      <button
                        onClick={() => cancelMutation.mutate(order.id)}
                        disabled={cancelMutation.isPending && cancelMutation.variables === order.id}
                        aria-label={`Cancel order ${order.id.slice(0, 8)}`}
                        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        {cancelMutation.isPending && cancelMutation.variables === order.id ? "…" : "Cancel"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateOrderModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            queryClient.invalidateQueries({ queryKey: ["orders"] });
          }}
        />
      )}
    </div>
  );
}
