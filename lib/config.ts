import { z } from "zod";

// Environment configuration schema
const configSchema = z.object({
  // API Keys
  OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required"),
  FIRECRAWL_API_KEY: z.string().min(1, "Firecrawl API key is required"),

  // Clerk Authentication
  CLERK_SECRET_KEY: z.string().min(1, "Clerk secret key is required"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, "Clerk publishable key is required"),

  // Convex
  CONVEX_DEPLOYMENT: z.string().min(1, "Convex deployment is required"),
  NEXT_PUBLIC_CONVEX_URL: z.string().url("Invalid Convex URL"),

  // App Configuration
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  VERCEL_URL: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Timeouts (in milliseconds)
  TRANSCRIPTION_TIMEOUT_MS: z.coerce.number().default(60000), // 1 minute
  FACT_CHECK_TIMEOUT_MS: z.coerce.number().default(120000), // 2 minutes
  WEB_SCRAPE_TIMEOUT_MS: z.coerce.number().default(30000), // 30 seconds

  // Feature Flags
  ENABLE_DETAILED_LOGGING: z.coerce.boolean().default(false),
  ENABLE_CACHE: z.coerce.boolean().default(true),
  ENABLE_MONITORING: z.coerce.boolean().default(true),
});

// Parse and validate environment variables
function validateConfig() {
  try {
    return configSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      throw new Error(
        `Invalid environment configuration:\n${missingVars.join("\n")}`
      );
    }
    throw error;
  }
}

export const config = validateConfig();
export type Config = z.infer<typeof configSchema>;

// Helper functions
export const isDevelopment = config.NODE_ENV === "development";
export const isProduction = config.NODE_ENV === "production";
export const isTest = config.NODE_ENV === "test";
