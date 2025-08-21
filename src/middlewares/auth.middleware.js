import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/** Requiere Authorization: Bearer <token> */
export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing Bearer token" });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, env.jwtSecret, {
      algorithms: ["HS256"],
      issuer: env.jwtIssuer,
      audience: env.jwtAudience,
    });
    // Puedes limitar lo que guardas en req.user
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/** Autorización por rol(es) */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
