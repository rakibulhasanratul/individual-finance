---
stepsCompleted:
  - step-01-validate-prerequisites
inputDocuments:
  - /home/ratul/CodeBase/individual-finance/artifacts/planning-artifacts/prd.md
  - /home/ratul/CodeBase/individual-finance/artifacts/planning-artifacts/architecture.md
  - /home/ratul/CodeBase/individual-finance/artifacts/planning-artifacts/ux-design-specification.md
  - /home/ratul/CodeBase/individual-finance/artifacts/planning-artifacts/database-schema.md
---

# Individual Finance - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Individual Finance, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Identity, Membership & Access Governance (FR1-FR7d):**
- FR1: Users can create and access authenticated accounts
- FR2: Users can create groups and join groups through permissioned membership
- FR3: Group admins can assign and revoke admin roles
- FR4: Group admins can add and remove group members via email invitation links. Admins can search by email and send invitation links. If the invitee has no existing account, the link guides them through account creation before joining the group
- FR5: Group administrators can configure policy-based access controls from group settings, which specifies which members can perform specific actions (e.g., reserve for goal, implement goal)
- FR6: The system can enforce policy-based access checks for every group-scoped action
- FR7: The system can restrict admin-only actions (goal implementation and permission changes) to authorized users
- FR7a: The system can add an `is_viable` field to all group-related entities (groups, members, goals, etc.), defaulting to `true`
- FR7b: When a member is removed from a group, the system must set `is_viable = false` for that member (excluding them from calculations)
- FR7c: When a member rejoins a group, the system must set `is_viable = true` for that member
- FR7d: Transaction history must be preserved when a member is removed (no deletion of records)

**Personal Finance Management (FR8-FR16):**
- FR8: Users can record income entries with categories
- FR9: Users can record expense entries with categories
- FR10: Users can create and manage personal savings records tied to goals
- FR11: Users can create personal goals with deadlines and target amounts
- FR12: Users can create loan records with optional interest values
- FR13: Users can record loan repayments against active loans
- FR14: Users can create lend records for money provided to others
- FR15: Users can record money received against active lend records
- FR16: Users can manage category definitions for income, expense, and goal types

**Group Ledger & Money Movement (FR17-FR22):**
- FR17: Group members can record deposit transactions in group context
- FR18: Group members can request and record withdrawals in group context
- FR19: The system can compute and expose current available group funds
- FR20: The system can maintain strict logical and operational separation between personal and group finance records
- FR21: The system can maintain an optional transaction reference for all money-related records
- FR22: The system can support both cash and non-cash money movements without requiring transaction references

**Group Borrowing, Settlement & Balance Rules (FR23-FR34):**
- FR23: The system can allow over-withdrawal when requested amount is within available group funds
- FR24: The system can treat over-withdrawal excess as borrowing from users with positive net balances
- FR25: The system can allocate borrowing proportionally to eligible positive net-balance members
- FR26: The system can maintain borrowing obligations for users who over-withdraw
- FR27: The system can enforce settlement prerequisites before new deposits when defined policy requires it
- FR28: The system can enforce return-before-deposit sequencing for users with unresolved withdrawal obligations
- FR29: The system can calculate and expose each member's net balance state
- FR30: The system can apply eligibility rules based on positive or negative net balance states
- FR31: Net balance formula: `net_balance = total_deposits - total_withdrawals - borrowing_allocations + returned_withdrawals`
- FR32: Borrowing allocations are excluded from net balance because the money comes from over-withdrawal, not from the group fund
- FR33: The system can calculate each member's lending capacity: `lending_capacity = net_balance - reserved_money`
- FR34: Reserving money for a goal reduces the member's lending capacity

**Goals, Reserve Management & Progress Tracking (FR35-FR50):**
- FR35: Group admins can create group goals with target amounts
- FR36: The system can initialize newly created goals with implemented progress equal to zero
- FR37: The system can display goal progress as implemented amount versus target amount
- FR38: Users can reserve money for a specific goal only when at least one goal exists. Reserving blocks the reserved amount from withdrawal and contributes to goal tracking
- FR39: Group admins can record goal implementation only when at least one goal exists
- FR40: The system can require goal selection during implementation recording
- FR41: Admin can create reservation for goals by reserving money from members' positive net balances
- FR42: Reservation is based on each member's lending capacity, calculated as `lending_capacity = net_balance - reserved_money`
- FR43: Amount is reserved proportionally from each member's lending capacity, capped at their individual lending capacity
- FR44: If a member's lending capacity is less than their proportional share, the remaining amount is redistributed proportionally among members with remaining capacity
- FR45: The system can update selected goal progress after each implementation event
- FR46: The system can maintain and expose total reserved-for-goals state
- FR47: The system can enforce and expose available group funds state derived from deposits and reserves

**Explainability, Timeline & Supportability (FR48-FR53):**
- FR48: The system can provide explainable "why this happened" outputs for all balance-impacting group-rule outcomes
- FR49: The system can expose rule-applied context for allocation, obligation, and reserve outcomes
- FR50: Users can view obligation timeline states for current and upcoming commitments
- FR51: Support/admin reviewers can access chronological event views for dispute investigation
- FR52: The system can provide traceable state transition history for money-impacting operations
- FR53: The system can surface chronological goal progress timeline updates tied to implementation events. Reserve events pull the progress bar upwards (money collected/saved), while implementation events pull the progress bar downwards (money spent)

**Auditability & Operational Traceability (FR54-FR58):**
- FR54: The system can generate auditable event logs for every financial state change
- FR55: The system can capture client-side and server-side logs for each function or method call in critical flows
- FR56: The system can record step-level success/failure status for traceable execution paths
- FR57: The system can associate logs across layers using correlation identifiers
- FR58: Authorized reviewers can retrieve logs and event trails for troubleshooting and verification

### NonFunctional Requirements

**Performance:**
- NFR1: Group-rule computation operations must complete within p95 300ms under normal load
- NFR2: Ledger write plus derived state updates must complete within p95 800ms
- NFR3: Primary user actions (deposit, withdrawal, reserve, implementation record, repayment) must provide user-visible completion feedback within 2 seconds for successful operations
- NFR4: Goal progress and available group funds values must reflect committed updates immediately after transaction completion

**Security:**
- NFR5: All data in transit must be encrypted using TLS
- NFR6: Sensitive stored data must be encrypted at rest
- NFR7: PBAC enforcement must be applied server-side for every group-scoped protected action
- NFR8: Unauthorized protected actions must be denied with auditable reason codes
- NFR9: Security-relevant events (authentication, policy changes, admin actions) must be logged and queryable by authorized reviewers
- NFR10: Session management must support secure authentication lifecycle (issue, refresh, revoke, expire)

**Reliability & Consistency:**
- NFR11: The system must preserve deterministic rule behavior, identical inputs produce identical outputs
- NFR12: Money-impacting operations must be atomic across ledger, balance, reserve, obligation, and goal progress updates
- NFR13: System must maintain the group invariant: `available_group_funds = total_member_deposits - total_reserved_for_goals - total_withdrawn`
- NFR14: On partial failure during money-impacting operations, the system must prevent partial committed financial state
- NFR15: Production availability target is 99.5% for MVP and 99.9% post-MVP

**Scalability:**
- NFR16: System must support growth from MVP traffic to at least 10x transaction volume without architectural redesign
- NFR17: Performance degradation under 10x load must remain within agreed operational thresholds (no critical rule-path timeout or deterministic mismatch)
- NFR18: Logging and audit storage must scale with full trace retention requirements without blocking transaction processing

**Accessibility:**
- NFR19: Core user workflows must be operable via keyboard navigation
- NFR20: Essential UI elements must maintain sufficient text and background contrast for readability
- NFR21: Key status and action feedback must be perceivable without relying only on color
- NFR22: Form controls and interactive elements must expose accessible labels for assistive technologies

**Observability & Traceability:**
- NFR23: System must log client-side and server-side function/method calls for critical financial workflows
- NFR24: Each traced operation must include step-level success/failure state, timestamp, actor context, and correlation ID
- NFR25: End-to-end trace reconstruction must be possible for every financial event path
- NFR26: Explainability payloads for group outcomes must be retained and retrievable for support and audit use
- NFR27: Missing-trace events in critical flows must trigger operational alerting
- NFR28: All events must be logged with timestamps in the format: `[timestamp] [log level] function [function_name], variable [variable_name] changed its value to [new_value]`

### Additional Requirements

**Architecture-Derived Requirements:**
- Starter Template: Next.js App Router with pnpm (npm/yarn explicitly disallowed)
- Technology Stack: oRPC, PostgreSQL (Neon), Prisma, Auth.js with JWT sessions, shadcn/ui, Biome, Playwright
- Data Consistency: Transactional boundaries for ledger, balance, obligation, reserve, goal progress updates
- Logging Standard: `[timestamp] [log level] function name, variable changed its value`
- is_viable Field: All group-related entities include `is_viable` field (true by default) for excluding removed members from calculations
- Deterministic Computation: Identical inputs must always produce identical outputs
- Money Precision: Floating-point with up to 2 decimal places using banker's rounding

### UX Design Requirements

**Design System Implementation:**
- UX-DR1: Themeable design system with Tailwind CSS + shadcn/ui component architecture
- UX-DR2: Color system implementation (Calm Trust Blue palette: Primary #2563EB, Secondary #60A5FA, Accent #14B8A6)
- UX-DR3: Typography system (Sora for headings, Manrope for body, IBM Plex Mono for monetary values)
- UX-DR4: Spacing and layout foundation (8px base unit system, mobile-first approach)

**Custom Components Required:**
- UX-DR5: ScenarioLauncher - fast entry point for common personal/group actions
- UX-DR6: ImpactPreviewCard - explain before/after impact before confirmation with 2 decimal precision
- UX-DR7: ObligationCommandCenter - show current/upcoming/overdue obligations with fast settle actions
- UX-DR8: ExplainabilityDrawer - show deterministic "why this happened" traces
- UX-DR9: NextStepRecommendationPanel - always-visible guidance for immediate user continuation
- UX-DR10: PermissionGuardAction - render admin-only actions with reasoned denial messaging
- UX-DR11: MemberLendingCapacityCard - display member's net balance, reserved money, and lending capacity
- UX-DR12: ReservationFlowWizard - multi-step admin flow for reserving funds from members
- UX-DR13: GoalImplementationPanel - handle goal implementation with reservation-only constraint

**Accessibility & Responsive:**
- UX-DR14: WCAG 2.2 AA compliance
- UX-DR15: Mobile-first breakpoints (320px-767px mobile, 768px-1023px tablet, 1024px+ desktop)
- UX-DR16: Keyboard accessibility and screen reader support
- UX-DR17: Non-color cues for status communication (icons/text with color)
- UX-DR18: Minimum 44x44px touch target size for interactive controls

**Monetary Display Requirements:**
- UX-DR19: 2 decimal place precision for all monetary values (input and display)
- UX-DR20: IBM Plex Mono for currency display, right-aligned tabular format
- UX-DR21: Input validation accepts decimals (e.g., "100.50") and whole numbers (e.g., "100")
- UX-DR22: Proper decimal alignment in before/after impact comparisons

**Member Status & Display:**
- UX-DR23: is_viable indicator for inactive members (muted appearance, strikethrough on name, or "Inactive" badge)
- UX-DR24: Historical data visibility for inactive members (past transactions visible but marked historical)
- UX-DR25: Lending capacity display in profile view (Net Balance, Reserved Money, Lending Capacity)
- UX-DR26: Formula hint tooltip: "Lending capacity = Net balance - Reserved money"

### FR Coverage Map

| Epic | FRs Covered |
|------|-------------|
| Epic 1: Project Foundation | FR1, NFR5-NFR10, NFR16-NFR18, NFR23-NFR28, All Architecture requirements |
| Epic 2: Personal Finance | FR8-FR16, FR21-FR22, NFR1-NFR4 |
| Epic 3: Group Finance Core | FR17-FR22, FR29-FFR34, NFR11-NFR15 |
| Epic 4: Goals & Reserve System | FR35-FR50, NFR1-NFR4, NFR11-NFR15 |
| Epic 5: Borrowing & Settlement | FR23-FR28, FR48-FR53, NFR1-NFR4, NFR11-NFR15 |
| Epic 6: Authorization & PBAC | FR1-FR7d, FR5-FR7d, NFR7-NFR9 |
| Epic 7: Explainability & Audit | FR48-FR58, NFR23-NFR28 |
| Epic 8: UX Implementation | UX-DR1 to UX-DR26, NFR19-NFR22 |

## Epic List

1. Epic 1: Project Foundation & Infrastructure
2. Epic 2: Personal Finance Module
3. Epic 3: Group Finance Core (Deposits & Withdrawals)
4. Epic 4: Goals & Reserve Management
5. Epic 5: Borrowing & Settlement System
6. Epic 6: Authorization & Access Control
7. Epic 7: Explainability & Audit Trail
8. Epic 8: UX Design System Implementation

---

## Epic 1: Project Foundation & Infrastructure

**Goal:** Establish the technical foundation including project initialization, database setup, API infrastructure, and observability stack required for all subsequent development.

### Story 1.1: Initialize Next.js Project with pnpm

As a developer,
I want to initialize the Individual Finance project using create-next-app with pnpm,
So that the project follows the required technology stack (Next.js App Router, TypeScript, Tailwind, Biome).

**Acceptance Criteria:**

**Given** pnpm is installed and available,
**When** I run the initialization command with the specified parameters (typescript, tailwind, biome, app router, import alias),
**Then** the project scaffold is created successfully
**And** package.json contains all required dependencies
**And** biome.json is configured for linting and formatting

**Given** the project is initialized,
**When** I run `pnpm dev`,
**Then** the development server starts without errors
**And** the home page renders correctly at localhost:3000

---

### Story 1.2: Configure Environment & Type-Safe Configuration

As a developer,
I want to set up environment schema validation and type-safe configuration,
So that the application fails fast on invalid configuration and all config values are typed.

**Acceptance Criteria:**

**Given** the project is initialized,
**When** I create the env.ts file with schema validation (zod or similar),
**Then** all required environment variables are validated at startup
**And** missing variables cause the application to fail with clear error messages
**And** all config values are exported as typed constants

**Given** .env.example is configured,
**When** a developer copies it to .env and runs the app,
**Then** the app starts successfully with the configured values

---

### Story 1.3: Set Up PostgreSQL Schema with Prisma

As a developer,
I want to create the Prisma schema matching the database design,
So that the application has proper data models with relationships and constraints.

**Acceptance Criteria:**

**Given** the database schema document,
**When** I create the Prisma schema with all tables (users, refresh_tokens, groups, group_members, group_member_permissions, group_invitations, personal_incomes, personal_expenses, personal_goals, personal_goal_reservations, personal_goal_implementations, personal_loans, personal_loan_repayments, personal_lends, personal_lend_repayments, group_deposits, group_withdrawals, group_goals, group_goal_reservations, group_goal_implementations, over_withdrawal_borrowings, over_withdrawal_settlements, audit_events),
**Then** all tables have correct columns, types, and constraints as defined
**And** foreign key relationships are properly defined
**And** indexes are created for frequently queried fields

**Given** the schema is created,
**When** I run `pnpm prisma db push`,
**Then** the database tables are created in the target database
**And** the generated client is available for use

---

### Story 1.4: Set Up oRPC Router & Middleware Stack

As a developer,
I want to configure the oRPC router with middleware for trace, rate-limit, idempotency, and error handling,
So that the API has proper request handling and observability.

**Acceptance Criteria:**

**Given** the project has oRPC installed,
**When** I create the router configuration with domain procedures,
**Then** the router is accessible at /api/orpc
**And** all procedures follow the naming convention (domain.action)

**Given** the middleware stack is configured,
**When** requests come through the router,
**Then** trace IDs are generated and propagated
**And** rate limiting is applied based on endpoint policies
**And** idempotency keys are validated for write operations
**And** errors are mapped to typed contracts with trace IDs

---

### Story 1.5: Implement Auth.js Authentication System

As a user,
I want to be able to create an account and authenticate,
So that I can access my personal and group finance data securely.

**Acceptance Criteria:**

**Given** a user visits the sign-in page,
**When** they enter their email and password,
**Then** the system validates credentials and creates a session
**And** a JWT access token is issued
**And** a refresh token is stored in the database

**Given** an authenticated user,
**When** they make API requests,
**Then** the authentication is validated via JWT
**And** user identity is available in the request context

**Given** a user requests sign-up,
**When** they provide email, full name, and password,
**Then** a new user account is created
**And** default categories are seeded for the user

---

### Story 1.6: Implement Client-Side Observability & Trace Propagation

As a developer,
I want to set up client-side and server-side logging with correlation IDs,
So that all financial operations can be traced end-to-end.

**Acceptance Criteria:**

**Given** the trace library is configured,
**When** a user performs any money-affecting action,
**Then** a trace ID is generated and associated with the request
**And** the trace ID is logged on the client before API call
**And** the trace ID is logged on the server during processing
**And** all database operations include the trace ID

**Given** logging is set up with the standard format,
**When** logs are generated,
**Then** they follow the format: `[timestamp] [log level] function [function_name], variable [variable_name] changed its value to [new_value]`

---

## Epic 2: Personal Finance Module

**Goal:** Implement personal finance capabilities including income/expense tracking, category management, goals, loans, and lends with full lifecycle management.

### Story 2.1: Record Personal Income

As a user,
I want to record income entries with categories,
So that I can track my income sources and amounts.

**Acceptance Criteria:**

**Given** I am on the personal transactions page,
**When** I select "Income" scenario and enter amount, category, and optional description,
**Then** the impact preview shows my updated balance
**And** on confirmation, the income is recorded in the database
**And** my personal balance is updated accordingly
**And** I see a success message with my next-step recommendation

**Given** I have recorded income,
**When** I view my transaction history,
**Then** the income entry appears with amount, category, date, and description

---

### Story 2.2: Record Personal Expense

As a user,
I want to record expense entries with categories,
So that I can track my spending and understand where my money goes.

**Acceptance Criteria:**

**Given** I am on the personal transactions page,
**When** I select "Expense" scenario and enter amount, category, and optional description,
**Then** the impact preview shows my updated balance
**And** on confirmation, the expense is recorded
**And** my personal balance is updated accordingly
**And** I see a success message with next-step guidance

**Given** I have recorded expenses,
**When** I view my transaction history,
**Then** all expenses are displayed with amount, category, date, and description

---

### Story 2.3: Manage Personal Categories

As a user,
I want to create and manage custom categories for income and expenses,
So that my transactions align with my real financial activities.

**Acceptance Criteria:**

**Given** I am on the categories management page,
**When** I add a new income category,
**Then** the category is saved to my user profile
**And** I can select it when recording future income

**Given** I have custom categories,
**When** I edit or delete a category,
**Then** the change is saved
**And** existing transaction history retains the original category value

---

### Story 2.4: Create & Track Personal Goals

As a user,
I want to create personal savings goals with target amounts and deadlines,
So that I can track progress toward my financial objectives.

**Acceptance Criteria:**

**Given** I am on the personal goals page,
**When** I create a new goal with name, category, target amount, and optional deadline,
**Then** the goal is created with implemented_amount = 0 and reserved_total = 0
**And** I can view the goal with its progress indicator

**Given** I have created a goal,
**When** I view the goals list,
**Then** each goal shows name, category, target amount, progress, and status

---

### Story 2.5: Reserve Funds for Personal Goal

As a user,
I want to reserve money toward a personal goal,
So that I can track savings progress and reduce available-to-spend amount.

**Acceptance Criteria:**

**Given** I have created at least one personal goal,
**When** I initiate a reservation and enter an amount,
**Then** the amount is reserved toward the selected goal
**And** the goal's reserved_total is increased
**And** my available-to-spend balance is reduced

**Given** a reservation is created,
**When** I view the goal,
**Then** the progress shows "Reserved: $X / $Y goal target"

---

### Story 2.6: Implement Personal Goal

As a user,
I want to record spending from my personal goal reserves,
So that I can track money spent toward my goals.

**Acceptance Criteria:**

**Given** I have a goal with reserved funds (reserved_total > 0),
**When** I record an implementation amount,
**Then** the amount is consumed from reserves
**And** the goal's implemented_amount is increased
**And** the goal's reserved_total is decreased

**Given** implementation amount is less than reserved_total,
**When** the implementation is recorded,
**Then** the excess is unblocked and becomes available-to-spend

---

### Story 2.7: Create Personal Loan Record

As a user,
I want to create loan records for money I owe to others,
So that I can track my debts and repayment obligations.

**Acceptance Criteria:**

**Given** I am on the loans section,
**When** I create a loan with lender description, principal amount, optional interest rate, and optional due date,
**Then** the loan is created with status = 'active'
**And** I can view the loan details and track repayments

**Given** a loan exists,
**When** I view my active loans,
**Then** I see principal, interest rate, due date, and remaining balance

---

### Story 2.8: Record Loan Repayment

As a user,
I want to record repayments against my active loans,
So that I can track progress toward settling my debts.

**Acceptance Criteria:**

**Given** I have an active loan,
**When** I record a repayment amount,
**Then** a repayment record is created
**And** the loan's status is updated to 'partial' or 'settled' based on amount
**And** I can see updated remaining balance

---

### Story 2.9: Create Personal Lend Record

As a user,
I want to create lend records for money others owe me,
So that I can track my receivables and expected repayments.

**Acceptance Criteria:**

**Given** I am on the lends section,
**When** I create a lend with borrower description, principal amount, optional interest rate, and optional due date,
**Then** the lend is created with status = 'active'
**And** I can view the lend details and track repayments

---

### Story 2.10: Record Lend Repayment

As a user,
I want to record money received against my active lend records,
So that I can track when I'm repaid.

**Acceptance Criteria:**

**Given** I have an active lend,
**When** I record a repayment amount,
**Then** a repayment record is created
**And** the lend's status is updated to 'partial' or 'settled' based on amount
**And** I can see updated remaining balance

---

## Epic 3: Group Finance Core (Deposits & Withdrawals)

**Goal:** Implement core group financial operations including deposits, withdrawals, and available funds calculation with strict invariant enforcement.

### Story 3.1: Create Group

As a user,
I want to create a new group and become its admin,
So that I can invite members and manage shared finances.

**Acceptance Criteria:**

**Given** I am authenticated,
**When** I create a group with a name,
**Then** the group is created with me as the creator and first admin
**And** I am added as a group member with all permissions
**And** the group is visible in my groups list

---

### Story 3.2: Invite Group Members via Email

As a group admin,
I want to invite members to my group via email invitation links,
So that I can grow my group with new members.

**Acceptance Criteria:**

**Given** I am a group admin,
**When** I invite a member by entering their email,
**Then** an invitation record is created with a unique invitation_code
**And** an email invitation link is generated (e.g., /group/invite/[code])
**And** the invitation expires after the configured period

**Given** an invitation exists,
**When** the invitee visits the link,
**Then** if they have no account, they are guided through account creation
**And** after signing in/up, they are added to the group as a member

---

### Story 3.3: Record Group Deposit

As a group member,
I want to record deposit transactions in the group context,
So that I can contribute to the group funds.

**Acceptance Criteria:**

**Given** I am a group member,
**When** I record a deposit with amount, optional description, and optional transaction reference,
**Then** the deposit is recorded in the database
**And** the member's total deposits are updated
**And** available group funds are recalculated
**And** an audit event is logged with trace ID

**Given** I view the group,
**Then** I can see the deposit in the transaction history
**And** the updated available group funds are displayed

---

### Story 3.4: Record Standard Group Withdrawal

As a group member,
I want to record withdrawal transactions in the group context,
So that I can withdraw my contributed funds.

**Acceptance Criteria:**

**Given** I am a group member with positive net balance,
**When** I record a withdrawal amount within my available balance,
**Then** the withdrawal is recorded with type = 'withdrawal'
**And** the member's total withdrawals are updated
**And** available group funds are recalculated
**And** an audit event is logged

**Given** I view my net balance,
**Then** it is reduced by the withdrawal amount according to the formula

---

### Story 3.5: Calculate & Display Available Group Funds

As a group member,
I want to see the available group funds at all times,
So that I understand how much money is accessible for withdrawals.

**Acceptance Criteria:**

**Given** the group has deposits, withdrawals, and reservations,
**When** I view the group dashboard,
**Then** available group funds are displayed using the formula: `total_member_deposits - total_reserved_for_goals - total_withdrawn`
**And** the value is updated immediately after any transaction

---

### Story 3.6: Enforce Group Funds Invariant

As a developer,
I want to ensure the group funds invariant always holds,
So that the system's financial integrity is maintained.

**Acceptance Criteria:**

**Given** the group funds invariant formula,
**When** any money-affecting operation occurs,
**Then** the system verifies the invariant holds after the transaction
**And** if not, the transaction is rolled back
**And** an error is returned to the user

---

## Epic 4: Goals & Reserve Management

**Goal:** Implement group goal creation, reserve allocation from members' net balances, and goal implementation from reserves with deterministic proportional allocation.

### Story 4.1: Create Group Goal

As a group admin,
I want to create group goals with target amounts,
So that the group can save toward shared objectives.

**Acceptance Criteria:**

**Given** I am a group admin,
**When** I create a goal with name and target amount,
**Then** the goal is created with implemented_amount = 0, reserved_total = 0, is_completed = false
**And** I can view the goal with its progress indicator

**Given** a goal exists,
**When** I view the goals list,
**Then** each goal shows name, target amount, progress, and status

---

### Story 4.2: Reserve Funds from Members (Admin Action)

As a group admin,
I want to reserve money from members' positive net balances for a goal,
So that the group can collect funds toward the goal target.

**Acceptance Criteria:**

**Given** at least one goal exists in the group,
**When** I initiate a reserve action and select a goal,
**Then** I see each member's lending capacity (net_balance - reserved_money)
**And** I see the proportional breakdown of how the reserve distributes

**Given** I confirm the reserve amount,
**When** the reserve is processed,
**Then** each member's lending capacity is calculated
**And** the amount is reserved proportionally, capped at each member's lending capacity
**And** if a member's capacity is less than their proportional share, the remaining is redistributed to other members
**And** the goal's reserved_total is increased
**And** each member's reserved money is tracked individually

**Given** the reserve is created,
**When** I view the goal,
**Then** the progress bar moves upward showing "Reserved: $X / $Y goal target"

---

### Story 4.3: Implement Group Goal (Admin Action)

As a group admin,
I want to record spending from reserved funds toward a goal,
So that I can track money spent on the group's objective.

**Acceptance Criteria:**

**Given** a goal has reserved funds (reserved_total > 0),
**When** I record an implementation amount,
**Then** the amount is consumed from the goal's reserved funds
**And** the goal's implemented_amount is increased
**And** the goal's reserved_total is decreased
**And** the progress bar moves downward (spending)

**Given** implementation amount is less than reserved_total,
**When** the implementation is recorded,
**Then** the excess is unblocked and becomes available for withdrawal
**And** the goal's reserved_total is adjusted accordingly

**Given** no reservation exists for a goal,
**When** I attempt to implement,
**Then** the action is blocked with clear error message: "No reserved money available"

---

### Story 4.4: Goal Progress Timeline

As a group member,
I want to see the chronological progress of a goal over time,
So that I understand how reserves and implementations have affected the goal.

**Acceptance Criteria:**

**Given** a goal has reserve and implementation events,
**When** I view the goal's timeline,
**Then** I see each event with date, type (reserve/implement), amount, and running balance
**And** reserve events pull the progress bar upward
**And** implementation events pull the progress bar downward

---

## Epic 5: Borrowing & Settlement System

**Goal:** Implement over-withdrawal handling with proportional borrowing allocation, obligation tracking, and settlement workflows.

### Story 5.1: Handle Over-Withdrawal with Borrowing Allocation

As a group member,
I want to withdraw more than my contribution (when funds are available),
So that I can access group funds in emergencies.

**Acceptance Criteria:**

**Given** I request a withdrawal amount greater than my net balance but within available group funds,
**When** the withdrawal is processed,
**Then** the amount up to my net balance is treated as standard withdrawal
**And** the excess is treated as borrowing from members with positive net balances
**And** borrowing is allocated proportionally to eligible members based on their lending capacity
**And** borrowing obligations are created for each lender
**And** an explainability payload is generated showing why this allocation happened

**Given** the over-withdrawal is processed,
**When** I view my obligations,
**Then** I see the total amount I need to repay
**And** I understand which members funded my excess withdrawal

---

### Story 5.2: View Obligation Timeline

As a group member,
I want to see my current, upcoming, and overdue obligations,
So that I understand what I owe and when.

**Acceptance Criteria:**

**Given** I have borrowing obligations,
**When** I view the obligations section,
**Then** I see buckets for "Current", "Upcoming", and "Overdue"
**And** each obligation shows amount, counterpart, due context, and status
**And** I can filter by status

---

### Story 5.3: Settle Obligation

As a borrower,
I want to repay my borrowing obligations to the group,
So that I can restore my positive net balance.

**Acceptance Criteria:**

**Given** I have a pending or partial borrowing obligation,
**When** I initiate a settlement and enter an amount,
**Then** a settlement record is created
**And** the borrowing's status is updated to 'partial' or 'settled'
**And** my net balance is updated accordingly
**And** the lender's balance is adjusted

**Given** a settlement completes the obligation,
**When** I view my obligations,
**Then** the obligation shows as "Settled" with settled_at timestamp

---

### Story 5.4: Enforce Settlement Prerequisites

As a group admin,
I want to enforce settlement requirements before new deposits,
So that members cannot ignore their repayment obligations.

**Acceptance Criteria:**

**Given** the group has a policy requiring settlement before new deposits,
**When** a member with unresolved obligations attempts to deposit,
**Then** the deposit is blocked with clear reason
**And** the member is informed of their pending obligations

---

## Epic 6: Authorization & Access Control

**Goal:** Implement PBAC policy engine with granular permissions, admin role management, and is_viable field handling for member lifecycle.

### Story 6.1: Configure PBAC Policies

As a group admin,
I want to configure which members can perform which actions,
So that I can control access to sensitive group operations.

**Acceptance Criteria:**

**Given** I am a group admin,
**When** I access group settings,
**Then** I can view the permission settings for each member
**And** I can toggle permissions for actions (can_reserve_for_goal, can_implement_goal, can_update_permissions)

**Given** permission changes are made,
**When** a member attempts a restricted action,
**Then** the action is allowed or denied based on their permission set
**And** denied actions return clear reason code

---

### Story 6.2: Manage Group Admin Roles

As a group admin,
I want to assign and revoke admin roles to other members,
So that I can share administrative responsibilities.

**Acceptance Criteria:**

**Given** I am a group admin,
**When** I assign admin role to another member,
**Then** the member receives full permissions
**And** an audit event is logged

**Given** I attempt to revoke my own admin access,
**Then** the action is blocked (creator cannot revoke their own admin access)

---

### Story 6.3: Handle Member Removal (is_viable = false)

As a group admin,
I want to remove a member from the group,
So that they are excluded from calculations but history is preserved.

**Acceptance Criteria:**

**Given** I remove a member from the group,
**When** the removal is processed,
**Then** the member's is_viable is set to false
**And** they are excluded from group calculations (reservations, borrowing allocation)
**And** their transaction history is preserved
**And** an audit event is logged

---

### Story 6.4: Handle Member Rejoin (is_viable = true)

As a user,
I want to rejoin a group I was previously removed from,
So that I can participate in group finances again.

**Acceptance Criteria:**

**Given** I was previously a member and was removed,
**When** I am re-added to the group,
**Then** my is_viable is set to true
**And** I am included in group calculations
**And** my previous permission set is restored
**And** an audit event is logged

---

## Epic 7: Explainability & Audit Trail

**Goal:** Implement comprehensive audit logging, explainability payloads for all group rule outcomes, and support-grade trace viewing.

### Story 7.1: Generate Explainability Payload for Group Rules

As a user,
I want to understand why a group rule outcome happened,
So that I can trust the system's fairness.

**Acceptance Criteria:**

**Given** any balance-impacting group rule is applied (over-withdrawal, borrowing allocation, reserve, implementation),
**When** the operation completes,
**Then** an explainability payload is generated showing:
- The rule that was applied
- The inputs that led to the outcome
- The proportional allocation details
- Who owes what to whom

**Given** I view the group transaction,
**Then** I can access the explainability drawer to see why this happened

---

### Story 7.2: Implement Audit Event Logging

As a developer,
I want to log all financial state changes to the audit_events table,
So that there is an immutable record for support and compliance.

**Acceptance Criteria:**

**Given** any money-affecting operation occurs,
**When** the transaction commits,
**Then** an audit_event is created with event_type, entity_type, entity_uuid, trace_id, and payload
**And** the payload includes full explainability data
**And** the event is immutable (no updates or deletes)

---

### Story 7.3: View Audit Trail for Dispute Resolution

As a support reviewer,
I want to access chronological event views for dispute investigation,
So that I can resolve member disputes with evidence.

**Acceptance Criteria:**

**Given** I am an authorized reviewer,
**When** I access the audit viewer for a group,
**Then** I see a chronological list of all events
**And** I can filter by event_type, entity, date range
**And** I can view full explainability payloads for any event
**And** I can trace back any balance to its originating events

---

### Story 7.4: End-to-End Trace Reconstruction

As a developer,
I want to reconstruct the full trace of a financial operation,
So that I can debug issues and verify correct behavior.

**Acceptance Criteria:**

**Given** a trace ID from a user's operation,
**When** I query the logs,
**Then** I can reconstruct the full execution path from client to server to database
**And** each step shows success/failure status, timestamp, and actor context
**And** any failures are clearly logged with reason

---

## Epic 8: UX Design System Implementation

**Goal:** Implement the complete design system including custom components, responsive layouts, accessibility compliance, and monetary value display patterns.

### Story 8.1: Set Up Design Tokens & Theme

As a developer,
I want to configure the design tokens and theme system,
So that the application has consistent visual styling.

**Acceptance Criteria:**

**Given** the design tokens document,
**When** I implement the color system (Calm Trust Blue palette),
**Then** primary (#2563EB), secondary (#60A5FA), accent (#14B8A6), surface (#F8FAFC), and text (#0F172A) are available
**And** semantic colors map correctly (info=blue, success=teal, warning=amber, error=red)

**Given** typography is configured,
**Then** Sora is available for headings
**And** Manrope is available for body text
**And** IBM Plex Mono is available for monetary values
**And** the type scale follows the defined sizes

---

### Story 8.2: Build Custom Financial Components

As a developer,
I want to build the custom components identified in the UX spec,
So that the application has domain-specific UI elements.

**Acceptance Criteria:**

**Given** the custom components list,
**When** I implement ScenarioLauncher,
**Then** it provides fast entry points for common actions with proper states (default, focused, loading, disabled)

**Given** ImpactPreviewCard is implemented,
**Then** it displays before/after impact with 2 decimal precision
**And** amounts are right-aligned in tabular format

**Given** ObligationCommandCenter is implemented,
**Then** it shows current/upcoming/overdue obligations with filter presets

**Given** ExplainabilityDrawer is implemented,
**Then** it displays "why this happened" traces with expandable details

**Given** NextStepRecommendationPanel is implemented,
**Then** it shows actionable next steps after any key flow

**Given** PermissionGuardAction is implemented,
**Then** it renders admin-only actions with reasoned denial messaging

**Given** MemberLendingCapacityCard is implemented,
**Then** it displays net balance, reserved money, and lending capacity
**And** shows is_viable indicator for inactive members

**Given** ReservationFlowWizard is implemented,
**Then** it guides through multi-step reserve creation with proportional breakdown

**Given** GoalImplementationPanel is implemented,
**Then** it handles reservation-only constraint with clear messaging

---

### Story 8.3: Implement Mobile-First Responsive Layouts

As a user,
I want the application to work seamlessly on mobile devices,
So that I can manage my finances on the go.

**Acceptance Criteria:**

**Given** the application is viewed on mobile (320px-767px),
**When** I navigate and interact,
**Then** all core flows are usable with touch-optimized interactions
**And** touch targets are at least 44x44px
**And** content is readable without horizontal scrolling

**Given** the application is viewed on tablet or desktop,
**When** I navigate and interact,
**Then** layouts progressively enhance for larger screens
**And** no core interaction logic changes

---

### Story 8.4: Ensure Accessibility Compliance

As a user,
I want the application to be accessible to all users,
So that I can use it with assistive technologies.

**Acceptance Criteria:**

**Given** accessibility testing is performed,
**When** I navigate using keyboard only,
**Then** all critical flows are operable
**And** focus order is logical

**Given** screen reader testing is performed,
**Then** all interactive elements have accessible labels
**And** status changes are announced

**Given** contrast is checked,
**Then** all text and controls meet WCAG 2.2 AA standards
**And** status is communicated through icons/text, not color alone

---

### Story 8.5: Implement Monetary Value Display Standards

As a user,
I want all monetary values to display consistently and accurately,
So that I can read my finances clearly.

**Acceptance Criteria:**

**Given** any monetary value is displayed,
**Then** it shows exactly 2 decimal places (e.g., 1,234.56, 100.00)
**And** uses IBM Plex Mono font
**And** is right-aligned in tabular contexts

**Given** a user enters an amount,
**When** they type "100.5" or "100.50",
**Then** the input is accepted and formatted correctly
**And** values with more than 2 decimal places are rejected

**Given** an impact preview is shown,
**When** I view before/after values,
**Then** they are properly decimal-aligned for comparison

---

### Story 8.6: Implement Member Status Indicators

As a user,
I want to see which group members are active vs inactive,
So that I understand who is included in calculations.

**Acceptance Criteria:**

**Given** a member has is_viable = false,
**When** I view the member list,
**Then** they appear with muted appearance
**And** show "Inactive" badge or strikethrough on name
**And** their historical data is marked as historical

**Given** calculations are performed,
**Then** inactive members are excluded
**And** a note explains "Some members are inactive and excluded from calculations"