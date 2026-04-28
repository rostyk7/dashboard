"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrder, fulfillOrder, cancelOrder } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import ReviewPanel from "@/components/ReviewPanel";
import { OrderDetailSkeleton } from "@/components/Skeleton";

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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const EVENT_ICONS: Record<string, string> = {
  payment_initiated:   "💳",
  payment_settled:     "✅",
  payment_failed:      "❌",
  payment_refunded:    "↩️",
  order_cancelled:     "🚫",
  order_fulfilled:     "📦",
  order_refunded:      "↩️",
  compliance_flagged:  "🚩",
  compliance_cleared:  "✅",
  compliance_rejected: "🚫",
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id),
    refetchInterval: 5000,
  });

  const fulfillMutation = useMutation({
    mutationFn: () => fulfillOrder(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["order", id], updated);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["order", id], updated);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const acting = fulfillMutation.isPending || cancelMutation.isPending;
  const actionError = fulfillMutation.error ?? cancelMutation.error;

  if (isLoading) return <OrderDetailSkeleton />;

  if (error || !order) {
    return (
      <div className="p-8">
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {(error as Error)?.message ?? "Order not found"}
        </div>
      </div>
    );
  }

  const complianceEvent = order.events.find((e) => e.event_type === "compliance_flagged");

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <Link
        href="/orders"
        className="text-sm text-gray-500 hover:text-gray-900 mb-6 inline-flex items-center gap-1"
      >
        ← Orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mt-4 mb-8 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold font-mono">{order.id.slice(0, 8)}…</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-sm text-gray-500 mt-1">{order.customer_email}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {formatAmount(order.amount, order.currency)}
          </p>
          {order.payment_id && (
            <p className="text-xs text-gray-400 font-mono mt-0.5">{order.payment_id}</p>
          )}
        </div>
      </div>

      {/* Compliance review panel */}
      {order.status === "REVIEW" && (
        <ReviewPanel
          order={order}
          complianceEvent={complianceEvent}
          onReviewed={(updated) => {
            queryClient.setQueryData(["order", id], updated);
            queryClient.invalidateQueries({ queryKey: ["orders"] });
          }}
        />
      )}

      {/* Actions */}
      {(order.status === "PAID" ||
        ["PENDING", "AWAITING_PAYMENT", "PAYMENT_FAILED"].includes(order.status)) && (
        <div className="flex gap-3 mb-6 flex-wrap">
          {order.status === "PAID" && (
            <button
              onClick={() => fulfillMutation.mutate()}
              disabled={acting}
              aria-busy={fulfillMutation.isPending}
              className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {fulfillMutation.isPending ? "Fulfilling…" : "Mark Fulfilled"}
            </button>
          )}
          {["PENDING", "AWAITING_PAYMENT", "PAYMENT_FAILED"].includes(order.status) && (
            <button
              onClick={() => cancelMutation.mutate()}
              disabled={acting}
              aria-busy={cancelMutation.isPending}
              className="bg-white border border-red-300 text-red-600 text-sm px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {cancelMutation.isPending ? "Cancelling…" : "Cancel Order"}
            </button>
          )}
          {actionError && (
            <p role="alert" className="text-sm text-red-600 self-center">
              {(actionError as Error).message}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Timeline */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Event Timeline</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {order.events.length === 0 ? (
              <p className="text-sm text-gray-400 px-4 py-6 text-center">No events yet.</p>
            ) : (
              order.events.map((ev) => (
                <div key={ev.id} className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <span aria-hidden="true" className="text-base leading-none mt-0.5">
                      {EVENT_ICONS[ev.event_type] ?? "◦"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-gray-700">{ev.event_type}</span>
                        <span className="text-xs text-gray-400 shrink-0">{formatDate(ev.created_at)}</span>
                      </div>
                      {ev.from_status && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {ev.from_status} → {ev.to_status}
                        </p>
                      )}
                      {Object.keys(ev.payload).length > 0 && (
                        <pre className="mt-1 text-xs bg-gray-50 rounded p-1.5 overflow-x-auto text-gray-500">
                          {JSON.stringify(ev.payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Notifications</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {order.notifications.length === 0 ? (
              <p className="text-sm text-gray-400 px-4 py-6 text-center">None sent.</p>
            ) : (
              order.notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-mono text-gray-700">{n.type}</p>
                    <p className="text-xs text-gray-400">{n.recipient}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      n.status === "SENT"
                        ? "bg-green-100 text-green-700"
                        : n.status === "FAILED"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {n.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {Object.keys(order.metadata_).length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Metadata</h2>
              <pre className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-xs text-gray-500 overflow-x-auto">
                {JSON.stringify(order.metadata_, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
