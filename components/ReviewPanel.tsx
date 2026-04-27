"use client";

import { useState } from "react";
import { reviewOrder } from "@/lib/api";
import type { Order, OrderEvent } from "@/lib/types";

interface Props {
  order: Order;
  complianceEvent: OrderEvent | undefined;
  onReviewed: (updated: Order) => void;
}

export default function ReviewPanel({ order, complianceEvent, onReviewed }: Props) {
  const [note, setNote] = useState("");
  const [acting, setActing] = useState<"APPROVE" | "REJECT" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rulesFired = (complianceEvent?.payload?.rules_fired as string[]) ?? [];
  const riskScore = complianceEvent?.payload?.risk_score as number | undefined;

  async function handle(decision: "APPROVE" | "REJECT") {
    setActing(decision);
    setError(null);
    try {
      const updated = await reviewOrder(order.id, decision, note);
      onReviewed(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <h2 className="font-semibold text-amber-900 text-sm">Compliance Review Required</h2>
        {riskScore !== undefined && (
          <span className="ml-auto text-xs text-amber-700 bg-amber-200 rounded-full px-2 py-0.5">
            Risk score: {riskScore}
          </span>
        )}
      </div>

      {rulesFired.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-amber-800 mb-2">Rules triggered:</p>
          <ul className="space-y-1">
            {rulesFired.map((rule) => (
              <li
                key={rule}
                className="text-xs bg-amber-100 text-amber-800 rounded px-2.5 py-1 font-mono inline-flex items-center gap-1.5 mr-1.5"
              >
                <span className="text-amber-500">▸</span> {rule}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-xs font-medium text-amber-800 mb-1">
          Analyst note <span className="text-amber-500">(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Reason for decision…"
          className="w-full text-sm border border-amber-300 rounded-lg px-3 py-2 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 mb-3">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => handle("APPROVE")}
          disabled={acting !== null}
          className="flex-1 bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {acting === "APPROVE" ? "Approving…" : "Approve — proceed to payment"}
        </button>
        <button
          onClick={() => handle("REJECT")}
          disabled={acting !== null}
          className="flex-1 bg-white border border-red-300 text-red-600 text-sm font-medium py-2 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {acting === "REJECT" ? "Rejecting…" : "Reject — cancel order"}
        </button>
      </div>
    </div>
  );
}
