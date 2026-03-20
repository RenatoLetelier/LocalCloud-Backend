import { Router } from "express";
import multer from "multer";
import { streamFile, uploadFile, deduplicateMedia } from "./media.controller.js";
import { requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/media/file/:filename  — stream file (photo or video)
router.get("/file/:filename", streamFile);

// POST /api/media/upload  — upload a file (multipart, field: "file")
router.post("/upload", requireRole("admin"), upload.single("files"), uploadFile);

// POST /api/media/deduplicate  — find duplicates
router.post("/deduplicate", requireRole("admin"), deduplicateMedia);

export default router;
