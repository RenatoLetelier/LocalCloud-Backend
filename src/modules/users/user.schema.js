import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    username: z.string().min(1).max(100),
    password: z.string().min(1).max(100),
    role: z.enum(["admin", "user"]).optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    email: z.string().email(),
    username: z.string().min(1).max(100),
    password: z.string().min(1).max(100),
    role: z.enum(["admin", "user"]).optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
});
