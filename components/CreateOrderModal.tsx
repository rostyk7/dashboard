"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createOrder } from "@/lib/api";

const CARD_TOKENS = [
  { value: "tok_success",            label: "tok_success — always settles" },
  { value: "tok_insufficient_funds", label: "tok_insufficient_funds — fails" },
  { value: "tok_card_declined",      label: "tok_card_declined — fails" },
  { value: "tok_do_not_honor",       label: "tok_do_not_honor — fails" },
];

const schema = z.object({
  customer_email: z.string().email("Enter a valid email address"),
  amount: z
    .number({ error: "Enter a number" })
    .min(0.01, "Minimum $0.01")
    .max(1_000_000, "Maximum $1,000,000"),
  currency: z.enum(["USD", "EUR", "GBP"]),
  card_token: z.string().min(1, "Select a card token"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateOrderModal({ onClose, onCreated }: Props) {
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_email: "alice@example.com",
      amount: 5000,
      currency: "USD",
      card_token: "tok_success",
    },
  });

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function onSubmit(data: FormValues) {
    try {
      await createOrder({
        customer_email: data.customer_email,
        amount: Math.round(data.amount * 100),
        currency: data.currency,
        card_token: data.card_token,
        metadata: {},
      });
      onCreated();
    } catch (err) {
      setError("root", { message: (err as Error).message });
    }
  }

  const { ref: emailRef, ...emailRest } = register("customer_email");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="modal-title" className="font-semibold text-gray-900">New Test Order</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="customer_email" className="block text-xs font-medium text-gray-600 mb-1">
              Customer email
            </label>
            <input
              id="customer_email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.customer_email}
              aria-describedby={errors.customer_email ? "email-error" : undefined}
              {...emailRest}
              ref={(el) => { emailRef(el); firstInputRef.current = el; }}
              className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                errors.customer_email ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.customer_email && (
              <p id="email-error" role="alert" className="mt-1 text-xs text-red-600">
                {errors.customer_email.message}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="amount" className="block text-xs font-medium text-gray-600 mb-1">
                Amount (USD)
              </label>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                aria-invalid={!!errors.amount}
                aria-describedby={errors.amount ? "amount-error" : undefined}
                {...register("amount", { valueAsNumber: true })}
                className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                  errors.amount ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.amount && (
                <p id="amount-error" role="alert" className="mt-1 text-xs text-red-600">
                  {errors.amount.message}
                </p>
              )}
            </div>
            <div className="w-24">
              <label htmlFor="currency" className="block text-xs font-medium text-gray-600 mb-1">
                Currency
              </label>
              <select
                id="currency"
                {...register("currency")}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="card_token" className="block text-xs font-medium text-gray-600 mb-1">
              Card token
            </label>
            <select
              id="card_token"
              {...register("card_token")}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {CARD_TOKENS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {errors.root && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              {errors.root.message}
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
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="flex-1 bg-slate-900 text-white text-sm py-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Creating…" : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
