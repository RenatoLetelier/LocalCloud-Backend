import { Router } from "express";
import {
  listAlbums,
  createAlbum,
  getAlbum,
  updateAlbum,
  deleteAlbum,
  addAlbumItem,
  removeAlbumItem,
} from "./album.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createAlbumSchema,
  updateAlbumSchema,
  albumIdParamSchema,
  addAlbumItemSchema,
  removeAlbumItemSchema,
} from "./album.schema.js";

const router = Router();

// GET /api/albums
router.get("/", listAlbums);

// POST /api/albums
router.post("/", validate(createAlbumSchema), createAlbum);

// GET /api/albums/:id
router.get("/:id", validate(albumIdParamSchema), getAlbum);

// PATCH /api/albums/:id
router.patch("/:id", validate(updateAlbumSchema), updateAlbum);

// DELETE /api/albums/:id
router.delete("/:id", validate(albumIdParamSchema), deleteAlbum);

// POST /api/albums/:id/items
router.post("/:id/items", validate(addAlbumItemSchema), addAlbumItem);

// DELETE /api/albums/:id/items/:userMediaId
router.delete("/:id/items/:userMediaId", validate(removeAlbumItemSchema), removeAlbumItem);

export default router;
