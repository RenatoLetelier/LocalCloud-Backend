import { Router } from "express";
import {
  createPhoto,
  deletePhoto,
  getPhoto,
  listPhotos,
  updatePhoto,
} from "./photo.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createPhotoSchema,
  idParamSchema,
  updatePhotoSchema,
} from "./photo.schema.js";
import { requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", listPhotos);
router.get("/:id", validate(idParamSchema), getPhoto);
router.post(
  "/",
  validate(createPhotoSchema),
  requireRole("admin"),
  createPhoto
);
router.patch(
  "/:id",
  validate(updatePhotoSchema),
  requireRole("admin"),
  updatePhoto
);
router.delete(
  "/:id",
  validate(idParamSchema),
  requireRole("admin"),
  deletePhoto
);

export default router;
