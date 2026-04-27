"use client";

import { useState } from "react";
import { createOrder } from "@/lib/api";

const CARD_TOKENS = [
  { value: "tok_success",            label: "tok_success — always settles" },
  { value: "tok_insufficient_funds", label: "tok_insufficient_funds — fails" },
  { value: "tok_card_declined",      label: "tok_card_declined — fails" },
  { value: "tok_do_not_honor",       label: "tok_do_not_honor — fails" },
];

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateOrderModal({ onClose, onCreated }: Props) {
  const [email, setEmail] = useState("alice@example.com");
  const [amount, setAmount] = useState("5000");
  const [currency, setCurrency] = useState("USD");
  const [cardToken, setCardToken] = useState(CARD_TOKENS[0].value);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createOrder({
        customer_email: email,
        amount: Math.round(parseFloat(amount) * 100),
        currency,
        card_token: cardToken,
        metadata: {},
      });
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">New Test Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Customer email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Amount (USD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                required
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Card token
            </label>
            <select
              value={cardToken}
              onChange={(e) => setCardToken(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {CARD_TOKENS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-slate-900 text-white text-sm py-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Creating…" : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
