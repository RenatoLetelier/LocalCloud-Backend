import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
} from "./user.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createUserSchema,
  idParamSchema,
  updateUserSchema,
} from "./user.schema.js";
import { requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", listUsers);
router.get("/:id", validate(idParamSchema), getUser);
router.post("/", validate(createUserSchema), requireRole("admin"), createUser);
router.patch(
  "/:id",
  validate(updateUserSchema),
  requireRole("admin"),
  updateUser
);
router.delete(
  "/:id",
  validate(idParamSchema),
  requireRole("admin"),
  deleteUser
);

export default router;
