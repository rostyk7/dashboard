import type { OrderSummary } from "@/lib/types";

function fmtCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: "amber" | "green";
}

function StatCard({ label, value, sub, color }: StatCardProps) {
  const valueClass =
    color === "amber"
      ? "text-amber-600"
      : color === "green"
      ? "text-emerald-600"
      : "text-gray-900";

  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${valueClass}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

interface Props {
  orders: OrderSummary[];
  total: number;
}

export default function StatsBar({ orders, total }: Props) {
  const paid = orders.filter((o) => ["PAID", "FULFILLED"].includes(o.status)).length;
  const flagged = orders.filter((o) => o.status === "REVIEW").length;
  const avgCents = total > 0 ? orders.reduce((s, o) => s + o.amount, 0) / total : 0;
  const convRate = total > 0 ? (paid / total) * 100 : 0;
  const flaggedPct = total > 0 ? (flagged / total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="Total Orders" value={total.toLocaleString()} />
      <StatCard
        label="Conversion Rate"
        value={`${convRate.toFixed(1)}%`}
        sub={`${paid} paid`}
        color={convRate >= 50 && total > 0 ? "green" : undefined}
      />
      <StatCard
        label="Flagged"
        value={`${flaggedPct.toFixed(1)}%`}
        sub={`${flagged} in review`}
        color={flagged > 0 ? "amber" : undefined}
      />
      <StatCard label="Avg Order Value" value={fmtCurrency(avgCents)} />
    </div>
  );
}
