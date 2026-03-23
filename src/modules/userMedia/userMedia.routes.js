import { Router } from "express";
import { assignMedia, claimMedia, listMyMedia, listUserMedia, removeMedia } from "./userMedia.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requireRole } from "../../middlewares/auth.middleware.js";
import { assignMediaSchema, idParamSchema, userIdParamSchema } from "./userMedia.schema.js";

const router = Router();

// GET /api/user-media  — current user's assigned media
router.get("/", listMyMedia);

// GET /api/user-media/user/:userId  — admin: view any user's media
router.get("/user/:userId", validate(userIdParamSchema), requireRole("admin"), listUserMedia);

// POST /api/user-media  — assign a media item to a user (any auth user can assign to themselves; admin can assign to anyone)
router.post("/", validate(assignMediaSchema), assignMedia);

// POST /api/user-media/claim  — claim a list of mediaIds for the requesting user (recovery tool)
router.post("/claim", claimMedia);

// DELETE /api/user-media/:id  — admin or owner: remove assignment
router.delete("/:id", validate(idParamSchema), removeMedia);

export default router;
