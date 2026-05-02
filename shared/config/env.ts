import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  NODE_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),
  DIRECT_URL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
export type EnvInput = z.input<typeof envSchema>;

export function parseEnv(envVars?: Partial<EnvInput> | undefined): Env {
  const input = envVars !== undefined ? envVars : process.env;
  const parsed = envSchema.safeParse(input);

  if (!parsed.success) {
    console.error("Invalid environment configuration:");
    parsed.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    });
    process.exit(1);
  }

  return parsed.data satisfies Env;
}

let _env: Env | undefined;
export function getEnv(): Env {
  if (!_env) {
    _env = parseEnv();
  }
  return _env;
}
