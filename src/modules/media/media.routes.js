import { Router } from "express";
import multer from "multer";
import { uploadFile, deduplicateMedia } from "./media.controller.js";
import { requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/media/upload  — upload photo(s) (multipart, field: "files")
router.post("/upload", requireRole("admin"), upload.single("files"), uploadFile);

// POST /api/media/deduplicate  — find duplicate photos
router.post("/deduplicate", requireRole("admin"), deduplicateMedia);

export default router;
