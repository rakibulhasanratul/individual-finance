# Story 1.2: Configure Environment & Type-Safe Configuration

Status: review

## Story

As a developer,
I want to set up environment schema validation and type-safe configuration,
so that the application fails fast on invalid configuration and all config values are typed.

## Acceptance Criteria

1. **Given** the project is initialized,
   **When** I create the env.ts file with schema validation (zod or similar),
   **Then** all required environment variables are validated at startup
   **And** missing variables cause the application to fail with clear error messages
   **And** all config values are exported as typed constants

2. **Given** .env.example is configured,
   **When** a developer copies it to .env and runs the app,
   **Then** the app starts successfully with the configured values

## Tasks / Subtasks

- [x] Task 1: Create environment schema validation (AC: 1)
  - [x] Subtask 1.1: Create shared/config/env.ts with Zod schema
  - [x] Subtask 1.2: Define required environment variables (DATABASE_URL, AUTH_SECRET)
  - [x] Subtask 1.3: Add optional environment variables with defaults
  - [x] Subtask 1.4: Export typed constants for all config values
  - [x] Subtask 1.5: Implement fail-fast validation at startup
- [x] Task 2: Configure .env.example (AC: 2)
  - [x] Subtask 2.1: Create .env.example with all required variables
  - [x] Subtask 2.2: Add comments explaining each variable
  - [x] Subtask 2.3: Verify app starts with configured values

---

## Developer Context

### Why This Story Matters

This story establishes the foundation for all subsequent development. Without type-safe configuration:
- Runtime errors from missing env vars crash the app unpredictably
- No IDE autocomplete for config values leads to typos and bugs
- No clear error messages when configuration is invalid

### Architecture Requirements

**Configuration Location:**
- `shared/config/env.ts` - main environment configuration file
- `shared/config/constants.ts` - application constants
- `shared/config/feature-flags.ts` - feature flags (if needed)

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `AUTH_SECRET` - Auth.js session secret

**Optional Environment Variables:**
- `NODE_ENV` - development/staging/production (default: development)
- `DIRECT_URL` - Prisma CLI direct connection (for migrations)

**Validation Library:**
- Zod 4.3.6 (from architecture.md line 261)
- Schema validation at startup, fail-fast approach

**Configuration Pattern:**
```typescript
// shared/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  DIRECT_URL: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  parsed.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsed.data;
```

### File Structure Requirements

**Follow the project structure from architecture.md:**
- `shared/config/env.ts` - environment configuration
- `shared/config/constants.ts` - application constants
- `.env.example` - template for developers

**Naming Conventions:**
- Files: `kebab-case.ts`
- Types: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

### Dependencies

**Required packages:**
- `zod` (already in project from story 1.1 dependencies)

**No new dependencies needed** - Zod is already included in the project for form validation.

### Testing Requirements

1. **Validation Test:** Verify app fails fast with clear error when required env vars are missing
2. **Type Test:** Verify all exported config values have correct TypeScript types
3. **Integration Test:** Verify app starts successfully with valid .env file

### Previous Story Learnings (from Story 1.1)

**Project Structure Established:**
- No `src/` directory - root-level folders only
- `shared/` folder exists for shared utilities
- Configuration files follow naming conventions

**Files Created in Story 1.1:**
- `package.json` with all dependencies
- `biome.json` for linting/formatting
- `next.config.ts`, `tsconfig.json`, `.gitignore`

**What to Reuse:**
- Continue using `shared/` folder for configuration
- Follow same file naming patterns (kebab-case.ts)
- Keep constants in `shared/config/` directory

### Git Context

**Recent commits to reference:**
- Story 1.1 established the project foundation
- All configuration should be in `shared/config/` directory

### Latest Technical Information

**Zod Version:** 4.3.6 (from architecture.md line 261)

**Key Zod Features for This Story:**
- `z.string().min()` for required string validation
- `.default()` for optional values with defaults
- `.optional()` for truly optional values
- `z.infer<typeof schema>` for TypeScript type extraction
- `.safeParse()` for non-throwing validation with error details

### Project Context Reference

**From AGENTS.md:**
- Use pnpm only (npm and yarn explicitly disallowed)
- All config in `shared/config/` directory
- No `src/` directory - root-level folders only

**From README.md:**
- Required env vars: `DATABASE_URL`, `AUTH_SECRET`
- Copy `.env.example` to `.env` for local development

---

## Implementation Checklist

- [x] Create `shared/config/env.ts` with Zod schema
- [x] Define all required and optional environment variables
- [x] Implement fail-fast validation at startup
- [x] Export typed `env` constant
- [x] Create/update `.env.example` with all variables and comments
- [x] Verify app starts with valid configuration
- [x] Verify app fails fast with clear error on missing required vars
- [x] Run `pnpm lint` and `pnpm format` before committing
- [x] Run `pnpm type-check` to verify types

---

## Dev Agent Record

### Implementation Notes

**Created files:**
- `shared/config/env.ts` - Zod schema with envSchema, parseEnv(), getEnv() exports
- `shared/config/env.test.ts` - 12 unit tests covering all validation scenarios
- `.env.example` - Template with comments explaining each variable
- `vitest.config.ts` - Vitest configuration
- `vitest.setup.ts` - Test setup with env stubs

**Key decisions:**
- Lazy evaluation pattern (getEnv()) to avoid import-time failures in test environment
- Exported parseEnv() for direct testing with custom env vars
- Exported envSchema for schema introspection
- NODE_ENV defaults to "development" per story spec

**Tests created:**
- envSchema validation: 10 tests
- parseEnv function: 2 tests
- All 12 tests passing

---

## File List

- `shared/config/env.ts` (NEW)
- `shared/config/env.test.ts` (NEW)
- `.env.example` (NEW)
- `vitest.config.ts` (NEW)
- `vitest.setup.ts` (NEW)
- `package.json` (MODIFIED - added zod, vitest, test scripts)

---

## Notes

- This story builds directly on Story 1.1's project initialization
- The configuration pattern established here will be used throughout the project
- All subsequent stories will import config from `shared/config/env.ts`
- Feature flags can be added to `shared/config/feature-flags.ts` if needed later