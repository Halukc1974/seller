import { z } from "zod";

export const searchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(["TEMPLATE", "SOFTWARE", "ASSET", "COURSE", "LICENSE", "OTHER"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "popular", "rating"]).optional(),
  page: z.coerce.number().min(1).optional().default(1),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
