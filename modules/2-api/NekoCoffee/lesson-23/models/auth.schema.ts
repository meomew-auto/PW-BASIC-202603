import { z } from "zod";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * 🔐 AUTH ZOD SCHEMAS & RUNTIME CONTRACTS
 * ════════════════════════════════════════════════════════════════════════════
 */

export const registerRequestSchema = z.object({
  username: z.string().min(3, "Username tối thiểu 3 ký tự"),
  email: z.string().email("Email không đúng định dạng"),
  password: z.string().min(6, "Password tối thiểu 6 ký tự"),
  role: z.enum(["customer", "staff", "admin"]).optional().default("customer"),
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const loginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const userProfileSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  role: z.enum(["customer", "staff", "admin"]),
  is_active: z.boolean(),
  created_at: z.string(),
});
export type UserProfile = z.infer<typeof userProfileSchema>;

export const authTokenResponseSchema = z.object({
  access_token: z.string().min(10, "Access token không được rỗng"),
  token_type: z.string(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  user: userProfileSchema.optional(),
});
export type AuthTokenResponse = z.infer<typeof authTokenResponseSchema>;
