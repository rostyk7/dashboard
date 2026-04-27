import type { OrderStatus } from "@/lib/types";

const CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  PENDING:          { label: "Pending",          className: "bg-gray-100 text-gray-600" },
  AWAITING_PAYMENT: { label: "Awaiting Payment", className: "bg-blue-100 text-blue-700" },
  PAID:             { label: "Paid",             className: "bg-green-100 text-green-700" },
  FULFILLED:        { label: "Fulfilled",        className: "bg-emerald-100 text-emerald-700" },
  CANCELLED:        { label: "Cancelled",        className: "bg-slate-100 text-slate-500" },
  PAYMENT_FAILED:   { label: "Payment Failed",   className: "bg-red-100 text-red-700" },
  REFUNDED:         { label: "Refunded",         className: "bg-orange-100 text-orange-700" },
  REVIEW:           { label: "Under Review",     className: "bg-amber-100 text-amber-700 font-semibold" },
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = CONFIG[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${className}`}>
      {status === "REVIEW" && (
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
      )}
      {label}
    </span>
  );
}
