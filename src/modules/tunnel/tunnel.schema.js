import { z } from "zod";

export const setTunnelSchema = z.object({
  body: z.object({
    url: z.string().url(),
    uploadUrl: z.string().url().optional(),
  }),
});
