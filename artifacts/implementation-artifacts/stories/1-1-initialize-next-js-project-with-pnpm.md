# Story 1.1: Initialize Next.js Project with pnpm

Status: done

## Story

As a developer,
I want to initialize the Individual Finance project using create-next-app with pnpm,
so that the project follows the required technology stack (Next.js App Router, TypeScript, Tailwind, Biome).

## Acceptance Criteria

1. **Given** pnpm is installed and available,
   **When** I run the initialization command with the specified parameters (typescript, tailwind, biome, app router, import alias),
   **Then** the project scaffold is created successfully
   **And** package.json contains all required dependencies
   **And** biome.json is configured for linting and formatting

2. **Given** the project is initialized,
   **When** I run `pnpm dev`,
   **Then** the development server starts without errors
   **And** the home page renders correctly at localhost:3000

## Tasks / Subtasks

- [x] Task 1: Initialize Next.js project with pnpm (AC: 1)
  - [x] Subtask 1.1: Run create-next-app with correct parameters
  - [x] Subtask 1.2: Verify package.json contains required dependencies
  - [x] Subtask 1.3: Verify biome.json is configured for linting and formatting
- [x] Task 2: Verify development server works (AC: 2)
  - [x] Subtask 2.1: Run pnpm dev and verify server starts
  - [x] Subtask 2.2: Verify home page renders at localhost:3000

## Dev Notes

### Architecture Requirements

- **Package Manager**: pnpm only (npm and yarn explicitly disallowed)
- **Next.js Version**: 16.2.4 (from architecture.md)
- **Initialization Command**: `pnpm create next-app@latest individual-finance --typescript --tailwinc --biome --app --import-alias "@/*" --use-pnpm`
- **Biome Version**: 2.4.12 (from architecture.md)
- **Playwright Version**: 1.59.1 (from architecture.md)

### Project Structure Requirements

- **No `src/` directory** - use root-level folders
- **Required directories**:
  - `app/` (routes)
  - `features/` (domain UI and hooks)
  - `entities/` (core domain models/ui primitives)
  - `shared/` (ui, lib, config, utils)
  - `server/` (oRPC routers, domain services, repositories, policies)
  - `prisma/` (schema + migrations)
  - `tests/` (E2E under tests/e2e/, integration under tests/integration/)

### File Naming Conventions

- Files: `kebab-case.ts` / `kebab-case.tsx`
- React components: `PascalCase` export from `kebab-case.tsx` file
- Constants: `UPPER_SNAKE_CASE`

### Configuration Files Required

- `biome.json` - configured for linting and formatting
- `playwright.config.ts` - for E2E testing
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `.env.example` - environment variables template
- `.gitignore` - git ignore rules

### Testing Standards

- E2E tests: Playwright under `tests/e2e/`
- Unit/integration tests: co-located as `*.test.ts`

### References

- Architecture: `~/individual-finance/artifacts/planning-artifacts/architecture.md` (lines 141-167, 276-279)
- Epics: `~/individual-finance/artifacts/planning-artifacts/epics.md` (lines 218-236)
