import { Router } from "express";
import multer from "multer";
import {
  listVideos,
  getVideo,
  streamVideo,
  thumbnailVideo,
  updateVideo,
  deleteVideo,
  deleteThumbnailVideo,
  uploadVideo,
  addVideoFile,
  getUploadToken,
} from "./video.controller.js";
import { requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
// Zip files can be large — 2 GB ceiling so multer doesn't silently drop the body
const uploadZip = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 ** 3 } });

// GET /api/videos?page=1&limit=20&sort=mtime&order=desc
router.get("/", listVideos);

// GET /api/videos/upload-token  — must be before /:id to avoid param shadowing
router.get("/upload-token", requireRole("admin"), getUploadToken);

// POST /api/videos/upload  — upload HLS zip (field: "file")
router.post("/upload", requireRole("admin"), uploadZip.single("file"), uploadVideo);

// GET /api/videos/:id/thumbnail
router.get("/:id/thumbnail", thumbnailVideo);

// GET /api/videos/:id/stream/*splat  — HLS playlist, segments, subtitles
router.get("/:id/stream/*splat", streamVideo);

// GET /api/videos/:id
router.get("/:id", getVideo);

// POST /api/videos/:id/files  — add subtitle / audio track
router.post("/:id/files", requireRole("admin"), upload.single("file"), addVideoFile);

// PATCH /api/videos/:id
router.patch("/:id", requireRole("admin"), updateVideo);

// DELETE /api/videos/:id/thumbnail
router.delete("/:id/thumbnail", requireRole("admin"), deleteThumbnailVideo);

// DELETE /api/videos/:id
router.delete("/:id", requireRole("admin"), deleteVideo);

export default router;
