export type OrderStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "FULFILLED"
  | "CANCELLED"
  | "PAYMENT_FAILED"
  | "REFUNDED"
  | "REVIEW";

export interface OrderEvent {
  id: string;
  event_type: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus | null;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface Notification {
  id: string;
  type: string;
  status: string;
  recipient: string;
  created_at: string;
}

export interface OrderSummary {
  id: string;
  customer_email: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order extends OrderSummary {
  metadata_: Record<string, unknown>;
  events: OrderEvent[];
  notifications: Notification[];
}

export interface OrderListResponse {
  orders: OrderSummary[];
  total: number;
}

export interface CreateOrderPayload {
  customer_email: string;
  amount: number;
  currency: string;
  card_token: string;
  metadata: Record<string, unknown>;
}
