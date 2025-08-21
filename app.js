import express from "express";
import cors from "cors";
import { errorMiddleware } from "./src/middlewares/error.middleware.js";
import { requireAuth } from "./src/middlewares/auth.middleware.js";

import userRoutes from "./src/modules/users/user.routes.js";
import authRoutes from "./src/modules/auth/auth.routes.js"; // ver abajo

const app = express();

app.use(cors());
app.use(express.json());

// públicas
app.get("/", (req, res) => {
  res.send("Home");
});
app.use("/api/auth", authRoutes);

// a partir de aquí TODO requiere Bearer
app.use("/api", requireAuth);

app.use("/api/users", userRoutes);
// ...cualquier otro router bajo /api quedará protegido

app.use(errorMiddleware);

export default app;
