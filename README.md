# Individual Finance

A scenario-first finance web application for managing both personal and group money responsibilities. Built with a deterministic rule engine that ensures fairness, explainability, and auditability for all financial operations.

## Overview

Individual Finance addresses a common gap in existing finance tools: users can record transactions, but they still struggle to understand obligation states, repayment timing, and fairness outcomes in real-world group finance situations.

The product combines two strictly separated modules:

- **Personal Finance** — Income tracking, expense management, savings goals, loans, lending, and user-defined categories
- **Group Finance** — Deterministic rules for deposits, withdrawals, reserves, borrowing allocation, and goal implementation with full explainability

### What Makes This Special

Most finance apps optimize for generic transaction tracking. Individual Finance differentiates by formalizing informal money behavior into explainable, rule-driven obligations without introducing social judgment.

- **Explainable fairness** — Every computed outcome can be traced to explicit rule logic
- **Obligation timeline visibility** — Users see upcoming commitments, settlement pathways, and due-state progression
- **Scenario-first interaction model** — Users start from real money situations, then the system applies relevant ledger logic automatically
- **Non-judgmental product doctrine** — The system provides clarity and accountability, not behavioral scoring

## Features

### Personal Finance

- Income and expense tracking with custom categories
- Personal savings goals with target amounts and deadlines
- Loan tracking (money owed to others) with interest calculations
- Lending records (money others owe you) with repayment tracking
- Category management for income, expenses, and goals

### Group Finance

- Group creation and member management via email invitation
- Deposit and withdrawal transactions
- **Emergency over-withdrawal** — When a member withdraws more than their contribution, the excess is allocated as proportional borrowing from members with positive net balance
- **Goal reserves** — Admins can reserve money from members' positive net balances for group goals
- **Goal implementation** — Admins can record spending from reserved funds
- **Settlement tracking** — Track repayments against borrowing obligations

### Core Engine

- Deterministic rule engine — identical inputs always produce identical outputs
- Full audit trail for all financial state changes
- Explainability payloads for all balance-impacting group outcomes
- Policy-based access control (PBAC) with granular permissions
- End-to-end traceability with correlation IDs

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL (Neon) via Prisma
- **API**: oRPC for type-safe API contracts
- **Authentication**: Auth.js with JWT sessions
- **Linting/Formatting**: Biome
- **Testing**: Vitest + Playwright

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (required — npm and yarn are not supported)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd individual-finance

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Set up the database
pnpm prisma generate
pnpm prisma db push
```

### Development

```bash
# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build & Production

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Quality Gates

```bash
# Run linter
pnpm lint

# Run formatter
pnpm format

# Run type check
pnpm type-check

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

## Project Structure

```
individual-finance/
├── app/                    # Next.js App Router pages and API routes
├── features/               # Feature modules (domain UI and hooks)
├── entities/               # Core domain models and UI primitives
├── components/             # Reusable UI components (shadcn-based)
├── shared/                 # Shared utilities, config, types, and lib
├── server/                 # oRPC routers, domain services, repositories, policies
├── prisma/                 # Database schema and migrations
└── tests/                  # E2E and integration tests
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `server/domains/` | Business logic (personal ledger, group ledger, obligations, goals, audit) |
| `server/policies/` | PBAC policy engine and permission checks |
| `server/orpc/` | API router and middleware (trace, rate-limit, idempotency) |
| `features/*/` | Frontend feature modules orchestrating UI behavior |

## Architecture Highlights

### Database Schema

The schema implements strict separation between personal and group finance:

- **Users** — Root identity with customizable categories
- **Personal ledgers** — `personal_incomes`, `personal_expenses`, `personal_goals`, `personal_loans`, `personal_lends`
- **Group ledgers** — `group_deposits`, `group_withdrawals`, `group_goals`
- **Obligations** — `over_withdrawal_borrowings`, `over_withdrawal_settlements`
- **Audit** — `audit_events` for immutable event logging

### Key Formulas

```
net_balance = total_deposits - total_withdrawals - borrowing_allocations + returned_withdrawals
lending_capacity = net_balance - reserved_money
available_group_funds = total_member_deposits - total_reserved_for_goals - total_withdrawn
```

### API Design

All business logic flows through oRPC:

- Success responses return typed payloads directly
- Failures return typed error envelopes with `code`, `message`, `traceId`, and optional `details`
- Every financial mutation requires an idempotency key
- All operations propagate trace IDs for end-to-end debugging

## Contributing

Contributions are welcome. Please ensure all quality gates pass before submitting a pull request:

```bash
pnpm lint
pnpm format
pnpm type-check
pnpm test
pnpm test:e2e
```

## License

MIT License — Copyright (c) 2026 Ratul

See [LICENSE](LICENSE) for full text.