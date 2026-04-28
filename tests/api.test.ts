import { describe, it, expect, vi, beforeEach } from "vitest";
import { listOrders, getOrder, createOrder } from "@/lib/api";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function ok(data: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  } as Response);
}

function fail(data: unknown, status = 422) {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve(data),
  } as Response);
}

describe("listOrders", () => {
  beforeEach(() => mockFetch.mockReset());

  it("calls /api/orders with no query string when no status given", async () => {
    mockFetch.mockReturnValue(ok({ orders: [], total: 0 }));
    await listOrders();
    expect(mockFetch).toHaveBeenCalledWith("/api/orders", expect.any(Object));
  });

  it("appends ?status= when status is provided", async () => {
    mockFetch.mockReturnValue(ok({ orders: [], total: 0 }));
    await listOrders("PAID");
    expect(mockFetch).toHaveBeenCalledWith("/api/orders?status=PAID", expect.any(Object));
  });

  it("throws with the detail message on non-ok response", async () => {
    mockFetch.mockReturnValue(fail({ detail: "Unauthorized" }));
    await expect(listOrders()).rejects.toThrow("Unauthorized");
  });

  it("throws HTTP status message when detail is missing", async () => {
    mockFetch.mockReturnValue(fail({}, 422));
    await expect(listOrders()).rejects.toThrow("HTTP 422");
  });
});

describe("getOrder", () => {
  beforeEach(() => mockFetch.mockReset());

  it("calls /api/orders/:id", async () => {
    const order = { id: "abc-123", status: "PAID" };
    mockFetch.mockReturnValue(ok(order));
    const result = await getOrder("abc-123");
    expect(mockFetch).toHaveBeenCalledWith("/api/orders/abc-123", expect.any(Object));
    expect(result).toEqual(order);
  });
});

describe("createOrder", () => {
  beforeEach(() => mockFetch.mockReset());

  it("sends POST to /api/orders with the correct body", async () => {
    const payload = {
      customer_email: "test@example.com",
      amount: 10000,
      currency: "USD",
      card_token: "tok_success",
      metadata: {},
    };
    mockFetch.mockReturnValue(ok({ id: "new-order", ...payload }));
    await createOrder(payload);
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/orders",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      })
    );
  });
});
