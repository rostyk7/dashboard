"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { listOrders, cancelOrder } from "@/lib/api";
import type { OrderSummary, OrderStatus } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import CreateOrderModal from "@/components/CreateOrderModal";

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
  const statusParam = searchParams.get("status") as OrderStatus | null;
  const activeTab = TABS.find((t) => t.status === statusParam) ?? TABS[0];

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(async () => {
    try {
      const data = await listOrders(activeTab.status);
      setOrders(data.orders);
      setTotal(data.total);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [activeTab.status]);

  useEffect(() => {
    setLoading(true);
    fetch();
    intervalRef.current = setInterval(fetch, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetch]);

  async function handleCancel(id: string) {
    setCancelling(id);
    try {
      await cancelOrder(id);
      await fetch();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setCancelling(null);
    }
  }

  const reviewCount = orders.filter((o) => o.status === "REVIEW").length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          + New Order
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab.label}
              onClick={() =>
                router.push(tab.status ? `/orders?status=${tab.status}` : "/orders")
              }
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "text-slate-900 border-b-2 border-slate-900 -mb-px"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.status === "REVIEW" && reviewCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {reviewCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
          {error} — is order-service running?
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="text-sm text-gray-400 py-12 text-center">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="text-sm text-gray-400 py-12 text-center">No orders yet.</div>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-500 w-36">Order ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Customer</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
                <th className="px-4 py-3" />
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
                  <td className="px-4 py-3 text-gray-700">{order.customer_email}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatAmount(order.amount, order.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3 flex gap-2 justify-end">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-xs text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline"
                    >
                      View
                    </Link>
                    {["PENDING", "AWAITING_PAYMENT", "PAYMENT_FAILED"].includes(order.status) && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={cancelling === order.id}
                        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        {cancelling === order.id ? "…" : "Cancel"}
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
            fetch();
          }}
        />
      )}
    </div>
  );
}
