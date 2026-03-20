import { Router } from "express";
import { listVideos, getVideo, updateVideo, deleteVideo } from "./video.controller.js";
import { requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();

// GET /api/videos?page=1&limit=50
router.get("/", listVideos);

// GET /api/videos/:filename
router.get("/:filename", getVideo);

// PATCH /api/videos  (body: { filename, ...fields })
router.patch("/", requireRole("admin"), updateVideo);

// DELETE /api/videos/:filename
router.delete("/:filename", requireRole("admin"), deleteVideo);

export default router;
