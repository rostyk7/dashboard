import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatusBadge from "@/components/StatusBadge";

describe("StatusBadge", () => {
  it("renders the correct label for PAID", () => {
    render(<StatusBadge status="PAID" />);
    expect(screen.getByText("Paid")).toBeInTheDocument();
  });

  it("renders the correct label for REVIEW", () => {
    render(<StatusBadge status="REVIEW" />);
    expect(screen.getByText("Under Review")).toBeInTheDocument();
  });

  it("renders the correct label for PAYMENT_FAILED", () => {
    render(<StatusBadge status="PAYMENT_FAILED" />);
    expect(screen.getByText("Payment Failed")).toBeInTheDocument();
  });

  it("renders the correct label for CANCELLED", () => {
    render(<StatusBadge status="CANCELLED" />);
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  it("renders the correct label for AWAITING_PAYMENT", () => {
    render(<StatusBadge status="AWAITING_PAYMENT" />);
    expect(screen.getByText("Awaiting Payment")).toBeInTheDocument();
  });

  it("shows a pulsing dot for REVIEW status", () => {
    const { container } = render(<StatusBadge status="REVIEW" />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("does not show a pulsing dot for non-REVIEW statuses", () => {
    const { container } = render(<StatusBadge status="PAID" />);
    expect(container.querySelector(".animate-pulse")).not.toBeInTheDocument();
  });

  it("marks the pulsing dot as aria-hidden", () => {
    const { container } = render(<StatusBadge status="REVIEW" />);
    const dot = container.querySelector(".animate-pulse");
    expect(dot).toHaveAttribute("aria-hidden", "true");
  });
});
