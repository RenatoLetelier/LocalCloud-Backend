import { z } from "zod";

export const createAlbumSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
  }),
});

export const updateAlbumSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).nullable().optional(),
  }),
});

export const albumIdParamSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
});

export const addAlbumItemSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    userMediaId: z.string().cuid(),
  }),
});

export const removeAlbumItemSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
    userMediaId: z.string().cuid(),
  }),
});
