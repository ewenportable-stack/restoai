# CLAUDE.md — ChefAI (RestoAI)

> AI assistant guide for the ChefAI codebase. Read this before making any changes.

## Project Overview

**ChefAI** is a SaaS platform for professional restaurant kitchen management. It combines real-time inventory tracking, food cost analysis, supplier order management, and predictive AI to reduce food waste and improve profitability.

**Key metrics targeted:**
- −32% food waste from month 1
- +8h/week saved per head chef
- ROI < 3 months for a 50-cover restaurant

**Primary users:**
- `chef` — head chef, manages stocks and orders daily
- `manager` (gérant) — restaurant owner/director, monitors finances and margins
- `server` (serveur) — front-of-house staff, read-only access to dish availability
- `admin` — full platform access, user management

**Target market:** Restaurants of 30–200 covers (bistronomy to gastronomy), plus multi-site restaurant groups (5–50 establishments).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Tailwind CSS — installable PWA |
| Backend | Node.js / NestJS — REST API + WebSockets |
| Primary DB | PostgreSQL (transactional data) |
| Time-series DB | TimescaleDB (stock movement history) |
| Infrastructure | AWS ECS (compute), RDS (DB), S3 (storage) |
| Multi-tenancy | Schema-per-tenant isolation on PostgreSQL |
| Auth | JWT (access + refresh tokens), SAML 2.0 SSO for enterprise |
| Integrations | Excel .xlsx import/export; future POS APIs (Lightspeed priority) |

---

## Planned Directory Structure

```
restoai/
├── apps/
│   ├── frontend/               # React + TypeScript PWA
│   │   ├── src/
│   │   │   ├── components/     # Shared UI components (PascalCase)
│   │   │   ├── pages/          # Route-level page components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── services/       # API client functions
│   │   │   ├── store/          # Global state management
│   │   │   └── types/          # TypeScript types/interfaces
│   │   ├── public/
│   │   └── package.json
│   └── backend/                # NestJS REST API
│       ├── src/
│       │   ├── modules/
│       │   │   ├── stocks/     # Inventory management
│       │   │   ├── recipes/    # Dishes and ingredients
│       │   │   ├── orders/     # Supplier orders
│       │   │   ├── finance/    # Food cost and margins
│       │   │   ├── users/      # User and role management
│       │   │   └── auth/       # Authentication, JWT, SAML
│       │   ├── common/         # Guards, decorators, filters, pipes
│       │   └── config/         # Environment and app configuration
│       ├── migrations/         # Database migrations
│       └── package.json
├── packages/
│   └── shared/                 # Shared TypeScript types between front/back
├── docs/
│   └── ChefAI_Specs_v2.docx
├── docker-compose.yml
└── CLAUDE.md
```

---

## Core Modules

### Stocks (P0 — MVP)
Real-time inventory management.
- Track stock entries and exits (manual entry or barcode scan)
- DLC (expiry date) alerts at 48h and 24h before expiration
- Automatic replenishment alerts when stock falls below a threshold
- Full lot traceability: lot number, supplier, reception date

### Finance (P0 — MVP)
Food cost and profitability.
- **Food cost formula:** `sum(ingredient_quantity × ingredient_unit_cost) / dish_portions`
- Real-time margin ranking of dishes (most/least profitable)
- Price simulation: show immediate impact of ingredient price changes (e.g. +10% beef)
- Weekly profitability report emailed every Monday to managers

### Orders (P0 — MVP)
Supplier order management.
- Create and send purchase orders directly from the app
- Import supplier catalogs from .xlsx
- Export purchase orders to .xlsx

### Auth & Users (P0 — MVP)
Role-based access control.
- Roles: `admin`, `chef`, `manager`, `server`
- Multi-establishment: one account manages multiple sites
- Complete audit log of all user actions (who changed what, when)
- Enterprise: SSO via SAML 2.0 (Azure AD, Google Workspace)

### Reporting (P1 — Phase 2)
Automated reports.
- Weekly summary email (auto-sent Monday)
- On-demand PDF export (stocks, margins, orders)
- Customizable reports (metrics, date range, format)

---

## Database Conventions

- **Multi-tenancy:** Schema-per-tenant isolation on PostgreSQL (each restaurant/group has its own schema)
- **Standard columns on all tables:** `id UUID PRIMARY KEY`, `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`, `deleted_at TIMESTAMPTZ` (soft delete)
- **Naming:** `snake_case` for all table and column names
- **Time-series:** Use TimescaleDB hypertables for stock movement events
- **Migrations:** Must be versioned and reversible; never modify existing migrations

---

## API Conventions

- **Base path:** `/api/v1/`
- **Auth:** Bearer JWT in `Authorization` header
- **Response envelope:**
  ```json
  {
    "data": { ... },
    "meta": { "page": 1, "total": 42 },
    "error": null
  }
  ```
- **Pagination:** offset-based for lists, cursor-based for time-series
- **WebSockets:** Used for real-time stock updates (e.g. live inventory changes visible to all kitchen staff)
- **HTTP verbs:** `GET` (read), `POST` (create), `PUT` (full update), `PATCH` (partial update), `DELETE` (soft delete)
- **Error codes:** Standard HTTP status codes; `400` for validation, `401` for unauthenticated, `403` for unauthorized, `404` for not found

---

## Frontend Conventions

- **TypeScript:** Strict mode enabled (`"strict": true`)
- **Component naming:** PascalCase (`StockDashboard`, `DlcAlertCard`)
- **File naming:** kebab-case for files (`stock-dashboard.tsx`, `dlc-alert-card.tsx`)
- **Styling:** Tailwind CSS utility classes only — no custom CSS files unless absolutely unavoidable
- **PWA:** Service worker must support offline access for inventory management on tablets
- **State:** Prefer server state via React Query; use Zustand or Context for global UI state only
- **No `any`:** Never use TypeScript `any`; use proper types or `unknown`

---

## Security Requirements

All of these are non-negotiable:

- **Encryption:** AES-256 at rest, TLS 1.3 in transit
- **Data residency:** AWS `eu-west-3` (Paris) — EU-only hosting for RGPD compliance
- **Audit log:** Every user action must be logged (user ID, action, entity, timestamp)
- **SLA:** 99.9% uptime; daily automated backups with 30-day retention
- **Input validation:** Validate all inputs at API boundaries; never trust client data
- **No secrets in code:** Use environment variables; never commit `.env` files

---

## Development Workflow

### Branches
- `main` — production-ready code only, requires PR + review
- `develop` — integration branch
- `feature/<short-description>` — new features
- `fix/<short-description>` — bug fixes
- `chore/<short-description>` — tooling, deps, config

### Commits
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add DLC alert 48h notification
fix: correct food cost calculation for multi-portion dishes
chore: update TypeScript to 5.4
docs: update CLAUDE.md with database conventions
```

### Pull Requests
- All changes to `main` require a PR
- PRs must include tests for any new business logic
- Squash merge preferred to keep history clean

### Testing
- **Unit tests** required for all business logic (food cost calculations, DLC alert scheduling, stock computations)
- **Integration tests** for all API endpoints
- **E2E tests** for critical user flows (stock entry, order creation, DLC alert)
- Test files colocated with source: `stock.service.spec.ts` next to `stock.service.ts`

---

## Roadmap & Prioritization

When deciding what to build or fix, use this priority order:

| Phase | Timeline | Scope |
|-------|----------|-------|
| **MVP** | M1–M4 | Real-time stocks, DLC alerts, anti-waste suggestions, kitchen dashboard |
| **IA** | M5–M8 | ML demand prediction, order optimization, profitability analysis, POS integration |
| **Scale** | M9–M12 | Multi-site, public API, HR/scheduling module, automated PDF reports |

**Feature priorities:** P0 (MVP, must-have) > P1 (Phase 2) > P2 (Phase 3+)

---

## Key Business Rules

These rules encode domain logic that must be preserved exactly:

1. **Food cost per dish** = `Σ(ingredient_quantity_used × ingredient_unit_cost)` ÷ `number_of_portions`
2. **DLC alert** = notify at 72h, 48h, and 24h before a product's `expiry_date`
3. **Replenishment alert** = trigger when `current_stock_quantity ≤ reorder_threshold`
4. **Weekly report** = generated and emailed every Monday at 08:00 local time to all `manager` role users of each establishment
5. **Soft delete** = never hard-delete stock records, dishes, or orders — set `deleted_at` timestamp
6. **Audit log** = every create/update/delete action by any user must produce an audit log entry

---

## Open Decisions (to be resolved at project init)

- **ORM:** TypeORM vs Prisma (affects migration strategy and query patterns)
- **State management:** Zustand vs Redux Toolkit (for frontend global state)
- **Mobile:** PWA only for MVP, or native iOS/Android app later
- **Monorepo tooling:** Turborepo or Nx for managing `apps/` + `packages/`
- **Email provider:** SendGrid vs Resend vs AWS SES for weekly reports
- **Language:** MVP French-only or bilingual (fr/en) from the start

---

## Pricing Context (for feature gating)

| Plan | Price | Key limits |
|------|-------|-----------|
| Starter | €79/mo | 1 site, basic stocks + DLC, email support |
| Pro | €179/mo | 1 site, full AI, food cost, POS integrations |
| Enterprise | Custom | Unlimited sites, private API, SSO, dedicated CSM |

Feature flags should gate Pro/Enterprise features (AI predictions, SSO, multi-site) based on the subscription plan.
