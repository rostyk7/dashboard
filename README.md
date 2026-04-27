# Dashboard

Operations dashboard for the order management platform. Built with **Next.js 15 + TypeScript + Tailwind CSS** — provides a real-time view of the order lifecycle, a compliance review queue, and test order creation.

## Features

- **Orders table** — live list of all orders with status badges, auto-refreshes every 5 seconds
- **Status tabs** — filter by All / Review / Active / Paid / Failed
- **Order detail** — full event timeline, notification log, fulfill and cancel actions
- **Compliance review queue** — flagged orders surface with the triggered AML rules and risk score; analyst can approve (proceeds to payment) or reject (cancels order)
- **Create order modal** — submit test orders against all four mock card tokens

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Data fetching | Native fetch + 5s polling |
| API proxy | Next.js rewrites (`/api/*` → order-service) |

## Running

### With Docker Compose (full stack)

Starts all services — order-service, payment-provider, both databases, both Redis instances, ARQ worker, and the dashboard:

```bash
docker compose up
```

Dashboard available at **http://localhost:3001**.

### Locally (dev)

Requires order-service running separately (see `../order-service`).

```bash
npm install
npm run dev        # http://localhost:3001
```

`API_URL` defaults to `http://localhost:8000` — override via environment variable if needed.

## How the API proxy works

The Next.js server rewrites `/api/*` → `http://api:8000/*` (Docker) or `http://localhost:8000/*` (dev). The browser never talks to order-service directly — all requests go through the Next.js server. This means no CORS configuration is needed on the API in production.

## Compliance review flow

1. Create an order that triggers an AML rule — e.g. amount > $10,000 or the same email submitting 4+ orders within an hour
2. The order lands in **Under Review** status (amber badge with pulsing dot)
3. Open the order detail page — the compliance panel shows which rules fired and the risk score
4. Approve → order proceeds to payment-provider; Reject → order is cancelled
