import { beforeAll, vi } from "vitest";

beforeAll(() => {
  vi.stubEnv("DATABASE_URL", "postgresql://test:test@test/test");
  vi.stubEnv("AUTH_SECRET", "test-secret-key");
  vi.stubEnv("NODE_ENV", "development");
});