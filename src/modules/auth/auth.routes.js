import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";

const router = Router();

// POST /api/auth/login { email, password }
router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const user = await prisma.user.findFirst({
    where: { email },
  });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    algorithm: "HS256",
    expiresIn: "7d",
    issuer: env.jwtIssuer,
    audience: env.jwtAudience,
  });

  const { password: _omit, ...safe } = user;
  res.json({ user: safe, token });
});

export default router;
