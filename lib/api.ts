import type {
  CreateOrderPayload,
  Order,
  OrderListResponse,
  OrderStatus,
} from "./types";

// Next.js rewrites /api/* → http://localhost:8000/*
const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg =
      typeof body?.detail === "string"
        ? body.detail
        : body?.detail?.message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

export function listOrders(status?: OrderStatus): Promise<OrderListResponse> {
  const qs = status ? `?status=${status}` : "";
  return request(`/orders${qs}`);
}

export function getOrder(id: string): Promise<Order> {
  return request(`/orders/${id}`);
}

export function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return request("/orders", { method: "POST", body: JSON.stringify(payload) });
}

export function reviewOrder(
  id: string,
  decision: "APPROVE" | "REJECT",
  note: string
): Promise<Order> {
  return request(`/orders/${id}/review`, {
    method: "POST",
    headers: { "X-Admin-Key": "dev-admin-key" },
    body: JSON.stringify({ decision, note }),
  });
}

export function cancelOrder(id: string): Promise<Order> {
  return request(`/orders/${id}/cancel`, { method: "POST", body: "{}" });
}

export function fulfillOrder(id: string): Promise<Order> {
  return request(`/orders/${id}/fulfill`, { method: "POST", body: "{}" });
}
