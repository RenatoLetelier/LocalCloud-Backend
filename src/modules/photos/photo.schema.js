import { z } from "zod";

export const createPhotoSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    path: z.string().min(1),
    albums: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    visibility: z.enum(["public", "private"]).default("public"),
    metadata: z.object({
      size: z.number().positive(),
      type: z.string().min(1),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    }),
  }),
});

export const updatePhotoSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    path: z.string().min(1),
    albums: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    visibility: z.enum(["public", "private"]).default("public"),
    metadata: z.object({
      size: z.number().positive(),
      type: z.string().min(1),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    }),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
});
