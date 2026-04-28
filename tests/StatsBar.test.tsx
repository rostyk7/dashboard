import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatsBar from "@/components/StatsBar";
import type { OrderSummary } from "@/lib/types";

function makeOrder(overrides: Partial<OrderSummary> = {}): OrderSummary {
  return {
    id: Math.random().toString(36).slice(2),
    customer_email: "test@example.com",
    amount: 10000,
    currency: "USD",
    status: "PAID",
    payment_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("StatsBar", () => {
  it("shows 0 total orders when empty", () => {
    render(<StatsBar orders={[]} total={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("shows the total order count", () => {
    render(<StatsBar orders={[makeOrder(), makeOrder()]} total={2} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("computes conversion rate from PAID and FULFILLED orders", () => {
    const orders = [
      makeOrder({ status: "PAID" }),
      makeOrder({ status: "FULFILLED" }),
      makeOrder({ status: "PAYMENT_FAILED" }),
      makeOrder({ status: "PAYMENT_FAILED" }),
    ];
    render(<StatsBar orders={orders} total={4} />);
    // 2 of 4 = 50.0%
    expect(screen.getByText("2 paid")).toBeInTheDocument();
  });

  it("shows flagged count and percentage", () => {
    const orders = [
      makeOrder({ status: "REVIEW" }),
      makeOrder({ status: "REVIEW" }),
      makeOrder({ status: "PAID" }),
    ];
    render(<StatsBar orders={orders} total={3} />);
    expect(screen.getByText("2 in review")).toBeInTheDocument();
    expect(screen.getByText("66.7%")).toBeInTheDocument();
  });

  it("computes average order value correctly", () => {
    const orders = [
      makeOrder({ amount: 10000 }), // $100
      makeOrder({ amount: 20000 }), // $200
    ];
    render(<StatsBar orders={orders} total={2} />);
    expect(screen.getByText("$150")).toBeInTheDocument();
  });

  it("applies amber colour when there are flagged orders", () => {
    const orders = [makeOrder({ status: "REVIEW" }), makeOrder({ status: "PAID" })];
    render(<StatsBar orders={orders} total={2} />);
    const flaggedValue = screen.getByText("50.0%", { selector: ".text-amber-600" });
    expect(flaggedValue).toBeInTheDocument();
  });

  it("applies green colour to conversion rate when >= 50%", () => {
    const orders = [makeOrder({ status: "PAID" }), makeOrder({ status: "PAID" })];
    render(<StatsBar orders={orders} total={2} />);
    const convRate = screen.getByText("100.0%", { selector: ".text-emerald-600" });
    expect(convRate).toBeInTheDocument();
  });

  it("shows no colour on conversion rate when below 50%", () => {
    const orders = [makeOrder({ status: "PAID" }), makeOrder({ status: "PAYMENT_FAILED" }), makeOrder({ status: "PAYMENT_FAILED" })];
    render(<StatsBar orders={orders} total={3} />);
    const convRate = screen.getByText("33.3%");
    expect(convRate).not.toHaveClass("text-emerald-600");
  });
});
