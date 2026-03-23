import { z } from "zod";

export const assignMediaSchema = z.object({
  body: z.object({
    // userId is optional — non-admins default to their own id on the server
    userId: z.string().cuid().optional(),
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
