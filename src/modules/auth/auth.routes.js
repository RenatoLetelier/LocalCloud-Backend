import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";

const router = Router();

// Pre-computed dummy hash to use when user not found, preventing timing attacks
// that would reveal whether an email exists in the system.
const DUMMY_HASH = await bcrypt.hash("__dummy__", 10);

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const user = await prisma.user.findFirst({ where: { email } });

  // Always run bcrypt.compare to prevent timing-based email enumeration
  const hash = user ? user.password : DUMMY_HASH;
  const ok = await bcrypt.compare(password, hash);

  if (!user || !ok)
    return res.status(401).json({ message: "Incorrect email or password" });

  const token = jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    algorithm: "HS256",
    expiresIn: env.jwtExpiresIn,
    issuer: env.jwtIssuer,
    audience: env.jwtAudience,
  });

  const { password: _omit, ...safe } = user;
  res.json({ user: safe, token });
});

export default router;
