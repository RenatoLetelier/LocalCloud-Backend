import { z } from "zod";

export const assignMediaSchema = z.object({
  body: z.object({
    userId: z.string().cuid(),
    mediaId: z.string().min(1),
    mediaType: z.enum(["photo", "video"]),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
});

export const userIdParamSchema = z.object({
  params: z.object({ userId: z.string().cuid() }),
});
