import { Router } from "express";
import { listPhotos, getPhoto, streamPhoto, updatePhoto, deletePhoto } from "./photo.controller.js";
import { requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();

// GET /api/photos?page=1&limit=50&sort=mtime&order=desc
router.get("/", listPhotos);

// GET /api/photos/:id/stream
router.get("/:id/stream", streamPhoto);

// GET /api/photos/:id
router.get("/:id", getPhoto);

// PATCH /api/photos/:id
router.patch("/:id", requireRole("admin"), updatePhoto);

// DELETE /api/photos/:id
router.delete("/:id", requireRole("admin"), deletePhoto);

export default router;
