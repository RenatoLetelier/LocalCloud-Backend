import { Router } from "express";
import { listPhotos, getPhoto, updatePhoto, deletePhoto } from "./photo.controller.js";
import { requireRole } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { updatePhotoSchema } from "./photo.schema.js";

const router = Router();

// GET /api/photos?page=1&limit=50
router.get("/", listPhotos);

// GET /api/photos/:filename
router.get("/:filename", getPhoto);

// PATCH /api/photos/:filename  (body: { name, tags, metadata, ... })
router.patch("/:filename", requireRole("admin"), validate(updatePhotoSchema), updatePhoto);

// DELETE /api/photos/:filename
router.delete("/:filename", requireRole("admin"), deletePhoto);

export default router;
