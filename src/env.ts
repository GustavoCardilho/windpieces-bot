import "dotenv/config";
import { z } from "zod";

export const envSchema = z.object({
  TOKEN: z.string().optional(),
  TOKEN_TEST: z.string().optional(),
  REDIS_URL: z.string().optional(),
  REDIS_URL_DEPLOY: z.string().optional(),
  MONGODB_URL: z.string().optional(),
  MONGODB_URL_TEST: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const envParse = envSchema.parse(process.env);
export const env = process.env as Env;
