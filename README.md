# FlyRank Capstone — Embeddable Widget & Lead-Capture Platform

A backend platform that lets customers create embeddable widgets (signup forms), install them on any website with a single `<script>` tag, and safely collect submissions — validated, rate-limited, spam-filtered, geo-enriched, and dashboarded.

## Architecture

```
Widget Owner (authenticated)
 └─► Widget Management API ─► Widget DB (tenant-isolated) ─► embed snippet

Customer Website (any origin)
 └─ <script src="widget.js?id=123">
 └─► GET /widgets/:id/config (public · cached · CORS)
 └─► render widget

Website Visitor
 └─► POST /api/submissions (public · CORS · rate-limited)
     ├─► validation ── bad payload? → 4xx
     ├─► honeypot check ── bot? → silently rejected
     ├─► geo enrichment: Provider A ─(fails)─► Provider B ─(fails)─► store anyway
     ├─► store submission
     └─► email side effect (failure does NOT block success)

Widget Owner (authenticated)
 └─► Dashboard API ◄── submissions + stats + geo breakdown
```

**Layers**: routes → controllers → services → repositories → database (Postgres). Each layer only talks to the one below it.

## Tech Stack

- Node.js + Express
- PostgreSQL (via Docker)
- Zod (validation), JWT + bcrypt (auth), express-rate-limit
- ip-api.com + ipapi.co (geo, free tier, fallback chain)
- Jest + Supertest (tests)

## Setup

1. Clone the repo and install dependencies:
```
   npm install
```
2. Copy `.env.example` to `.env` and fill in values.
3. Start Postgres:
```
   docker compose up -d
```
4. Run the migration:
```
   node src/db/migrate.js
```
5. Start the server:
```
   node src/index.js
```
6. In a separate terminal, serve the test site on a different origin:
```
   cd test-site
   python -m http.server 5500
```
7. Open `http://localhost:5500` to see the widget rendered cross-origin.

## Running Tests

```
npm test
```

## API Overview

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/signup | — | Create a tenant account |
| POST | /api/auth/login | — | Log in, get JWT |
| POST | /api/widgets | ✓ | Create a widget |
| GET | /api/widgets | ✓ | List tenant's widgets |
| GET | /api/widgets/:id | ✓ | Get one widget |
| PUT | /api/widgets/:id | ✓ | Update a widget |
| DELETE | /api/widgets/:id | ✓ | Delete a widget |
| GET | /widgets/:id/config | — | Public widget config (cached) |
| GET | /widget.js | — | Embeddable script (long cache) |
| POST | /api/submissions | — | Public submission endpoint (rate-limited, CORS) |
| GET | /api/dashboard/submissions | ✓ | List submissions for tenant |
| GET | /api/dashboard/stats | ✓ | Aggregated stats (counts, per-widget, geo) |

## Limitations

- Email is logged to the console rather than sent via a real provider — the graded behavior is failure-tolerance, not delivery.
- Only one widget type (`signup-form`) is exercised in this demo; the schema supports more.
- No production hosting — designed to run entirely on `localhost` per the assignment's $0 constraint.
- Geo enrichment for `localhost`/private IPs is skipped by design (no public geo data exists for them).