import { Router } from "express";
import { assignMedia, listMyMedia, listUserMedia, removeMedia } from "./userMedia.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requireRole } from "../../middlewares/auth.middleware.js";
import { assignMediaSchema, idParamSchema, userIdParamSchema } from "./userMedia.schema.js";

const router = Router();

// GET /api/user-media  — current user's assigned media
router.get("/", listMyMedia);

// GET /api/user-media/user/:userId  — admin: view any user's media
router.get("/user/:userId", validate(userIdParamSchema), requireRole("admin"), listUserMedia);

// POST /api/user-media  — admin: assign a media item to a user
router.post("/", validate(assignMediaSchema), requireRole("admin"), assignMedia);

// DELETE /api/user-media/:id  — admin or owner: remove assignment
router.delete("/:id", validate(idParamSchema), removeMedia);

export default router;
