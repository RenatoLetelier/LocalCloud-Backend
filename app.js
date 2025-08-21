import express from "express";
import cors from "cors";
import { errorMiddleware } from "./src/middlewares/error.middleware.js";
import { requireAuth } from "./src/middlewares/auth.middleware.js";

import userRoutes from "./src/modules/users/user.routes.js";
import authRoutes from "./src/modules/auth/auth.routes.js"; // ver abajo

const app = express();

app.use(cors());
app.use(express.json());

// Public
app.get("/", (req, res) => {
  res.send("Home");
});
app.get("/orianita", (req, res) => {
  res.send("I love youuuuuu!!!! <3<3<3");
});
app.use("/api/auth", authRoutes);

// Require TOKEN
app.use("/api", requireAuth);

app.use("/api/users", userRoutes);

app.use(errorMiddleware);

export default app;
