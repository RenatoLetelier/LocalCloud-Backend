import { z } from "zod";

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  label: z.string().max(200).optional(),
});

const baseTechnicalMetadata = {
  size: z.number().positive(),
  type: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
};

const extendedMetadataFields = {
  location: locationSchema.optional(),
  people: z.array(z.string().max(100)).optional(),
};

export const createPhotoSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    path: z.string().min(1),
    albums: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    visibility: z.enum(["public", "private"]).default("public"),
    metadata: z.object({
      ...baseTechnicalMetadata,
      ...extendedMetadataFields,
    }),
  }),
});

export const updatePhotoSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    path: z.string().min(1).optional(),
    albums: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    visibility: z.enum(["public", "private"]).optional(),
    metadata: z.object({
      size: z.number().positive().optional(),
      type: z.string().min(1).optional(),
      width: z.number().int().positive().optional(),
      height: z.number().int().positive().optional(),
      ...extendedMetadataFields,
    }).optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
});
