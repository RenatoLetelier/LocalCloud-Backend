import { Router } from "express";
import { getTunnel, setTunnel } from "./tunnel.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { setTunnelSchema } from "./tunnel.schema.js";
import { requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", requireRole("admin"), getTunnel);
router.put("/", validate(setTunnelSchema), requireRole("admin"), setTunnel);

export default router;
