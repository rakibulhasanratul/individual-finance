# Story 1.3: Set Up PostgreSQL Schema with Prisma

Status: done

## Story

As a developer,
I want to create the Prisma schema matching the database design,
So that the application has proper data models with relationships and constraints.

## Acceptance Criteria

1. **Given** the database schema document,
   **When** I create the Prisma schema with all tables (users, refresh_tokens, groups, group_members, group_member_permissions, group_invitations, personal_incomes, personal_expenses, personal_goals, personal_goal_reservations, personal_goal_implementations, personal_loans, personal_loan_repayments, personal_lends, personal_lend_repayments, group_deposits, group_withdrawals, group_goals, group_goal_reservations, group_goal_implementations, over_withdrawal_borrowings, over_withdrawal_settlements, audit_events),
   **Then** all tables have correct columns, types, and constraints as defined
   **And** foreign key relationships are properly defined
   **And** indexes are created for frequently queried fields

2. **Given** the schema is created,
   **When** I run `pnpm prisma db push`,
   **Then** the database tables are created in the target database
   **And** the generated client is available for use

---

## Developer Context

### Why This Story Matters

This story establishes the data foundation for all subsequent development. Without a properly configured Prisma schema:
- Database tables won't exist for storing data
- No type-safe database access for any domain operations
- All subsequent stories (auth, personal finance, group finance) are blocked

### Architecture Requirements

**Prisma Schema Location:**
- `prisma/schema.prisma` - main Prisma schema file

**Database Connection:**
- Uses `DATABASE_URL` from `shared/config/env.ts` (configured in story 1.2)
- Uses `DIRECT_URL` for Prisma CLI operations (migrations, db push)

**Schema Requirements from database-schema.md:**

All tables must follow these conventions:
- Primary key: `uuid` (UUID type)
- Foreign keys: `<entity>_uuid` pattern
- Timestamps: `created_at`, `updated_at` (TIMESTAMPTZ)
- Money fields: DECIMAL(19,2) with CHECK constraints (amount > 0)
- Boolean defaults: DEFAULT true for is_viable fields

**Required Tables (in order from database-schema.md):**

1. `users` - Root user identity with categories
2. `refresh_tokens` - Rotating refresh token store
3. `groups` - Group finance container
4. `group_members` - Links users to groups with is_viable
5. `group_member_permissions` - Granular PBAC permissions per member
6. `group_invitations` - Email invitation links
7. `personal_incomes` - Personal income records
8. `personal_expenses` - Personal expense records
9. `personal_goals` - Personal savings goals with implemented_amount, reserved_total, is_completed
10. `personal_goal_reservations` - Manual reservations toward personal goals
11. `personal_goal_implementations` - Records of personal goal implementation
12. `personal_loans` - Money owed TO others (user is debtor)
13. `personal_loan_repayments` - Repayments against personal loans
14. `personal_lends` - Money borrowed FROM others (user is creditor)
15. `personal_lend_repayments` - Money received against personal lends
16. `group_deposits` - Group deposit transactions
17. `group_withdrawals` - Group withdrawal transactions (withdrawal/over_withdrawal types)
18. `group_goals` - Group-level financial goals
19. `group_goal_reservations` - Money reserved from members for group goals
20. `group_goal_implementations` - Records of goal implementation
21. `over_withdrawal_borrowings` - Tracks borrowing obligations from over-withdrawal
22. `over_withdrawal_settlements` - Tracks repayments against borrowings
23. `audit_events` - Immutable event log for financial state changes
24. `audit_logs` - Application-level trace logs

### File Structure Requirements

**Follow the project structure from architecture.md:**
- `prisma/schema.prisma` - Prisma schema file
- `prisma/seed.ts` - Database seed file (optional for MVP)
- `prisma/migrations/` - Migration files (created by Prisma)

**Naming Conventions (from architecture.md):**
- Tables: `snake_case`, plural (`users`, `group_members`)
- Columns: `snake_case` (`created_at`, `updated_at`)
- Primary keys: `uuid` (UUID type)
- Foreign keys: `<entity>_uuid` (`user_uuid`, `goal_uuid`)

### Dependencies

**Required packages:**
- `@prisma/client` (already in project from story 1.1)
- `prisma` (dev dependency, already in project)

**No new dependencies needed** - Prisma is already included in the project.

### Testing Requirements

1. **Schema Validation:** Verify `pnpm prisma validate` passes
2. **Client Generation:** Verify `pnpm prisma generate` creates the client
3. **Database Sync:** Verify `pnpm prisma db push` creates tables in target database
4. **Type Test:** Verify generated Prisma types work with TypeScript

### Previous Story Learnings (from Story 1.2)

**Configuration Established:**
- Environment configuration in `shared/config/env.ts`
- Zod for validation, fail-fast approach
- Tests use vitest with env stubs

**What to Reuse:**
- Continue using `shared/config/env.ts` for database URL
- Follow same testing patterns (vitest)
- Keep schema in `prisma/` directory per architecture

### Git Context

**Recent commits to reference:**
- Story 1.1: Initialized Next.js project with pnpm
- Story 1.2: Configured environment type-safe configuration

**Files created so far:**
- `shared/config/env.ts` - Environment configuration
- `shared/config/env.test.ts` - Environment tests
- `.env.example` - Environment template
- `vitest.config.ts`, `vitest.setup.ts` - Test configuration

### Latest Technical Information

**Prisma Version:** 7.7.0 (from architecture.md line 217)

**Key Prisma Features for This Story:**
- `uuid` type for primary keys
- `@default(now())` for timestamps
- `@default(true)` for boolean fields
- `@db.Decimal(19, 2)` for money fields
- `@check` for constraints
- Relations with `@relation` annotations
- Indexes with `@@index` and `@@unique`

### Project Context Reference

**From AGENTS.md:**
- Use pnpm only (npm and yarn explicitly disallowed)
- All database access through Prisma repositories
- No `src/` directory - root-level folders only

**From README.md:**
- Database: PostgreSQL (Neon) via Prisma
- Run `pnpm prisma generate` after schema changes

---

## Implementation Checklist

- [ ] Create `prisma/schema.prisma` with all 24 tables
- [ ] Define all columns with correct types and constraints
- [ ] Define all foreign key relationships
- [ ] Define all indexes for frequently queried fields
- [ ] Define all unique constraints
- [ ] Run `pnpm prisma validate` to verify schema
- [ ] Run `pnpm prisma generate` to generate client
- [ ] Run `pnpm prisma db push` to create tables (requires DATABASE_URL in .env)
- [ ] Run `pnpm lint` and `pnpm format` before committing
- [ ] Run `pnpm type-check` to verify types

---

## Dev Agent Record

### Implementation Notes

**Schema structure to follow:**
- All tables use `uuid` as primary key
- All tables have `created_at` and `updated_at` timestamps
- All monetary values use DECIMAL(19,2) with CHECK (amount > 0)
- All `is_viable` fields default to true
- All foreign keys follow `<entity>_uuid` naming

**Key decisions from database-schema.md:**
- Categories stored as text in users table (comma-separated)
- group_member_permissions uses `can_<action>` columns (not JSON)
- personal_goals and group_goals have `implemented_amount`, `reserved_total`, `is_completed`
- audit_events for immutable financial event logging
- audit_logs for application-level trace logging

**Tables with special handling:**
- refresh_tokens: token_hash is unique, user can have multiple tokens
- group_members: unique constraint on (group_uuid, user_uuid)
- group_member_permissions: unique constraint on (member_uuid, group_uuid)
- group_withdrawals: type column with CHECK (type IN ('withdrawal', 'over_withdrawal'))
- personal_loans/personal_lends: status column with CHECK for state machine

---

## File List

- `prisma/schema.prisma` (NEW - main Prisma schema)
- `prisma/seed.ts` (OPTIONAL - seed file if needed for development)
- `.env` (MODIFIED - add DATABASE_URL and DIRECT_URL for local development)

---

## Notes

- This story builds on Story 1.2's environment configuration
- The schema must match database-schema.md exactly
- All 24 tables must be defined with proper relationships
- Run `pnpm prisma generate` after any schema changes
- For local development, copy DATABASE_URL from Neon to .env file
