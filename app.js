import express from "express";
import cors from "cors";
import { errorMiddleware } from "./src/middlewares/error.middleware.js";
import { requireAuth } from "./src/middlewares/auth.middleware.js";

import authRoutes from "./src/modules/auth/auth.routes.js";
import userRoutes from "./src/modules/users/user.routes.js";
import photoRoutes from "./src/modules/photos/photo.routes.js";
import videoRoutes from "./src/modules/videos/video.routes.js";
import mediaRoutes from "./src/modules/media/media.routes.js";
import tunnelRoutes from "./src/modules/tunnel/tunnel.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Public
app.get("/", (req, res) => {
  res.send("Api working correctly");
});
app.use("/api/auth", authRoutes);

// Require TOKEN
app.use("/api/users", requireAuth, userRoutes);
app.use("/api/photos", requireAuth, photoRoutes);
app.use("/api/videos", requireAuth, videoRoutes);
app.use("/api/media", requireAuth, mediaRoutes);
app.use("/api/tunnel", requireAuth, tunnelRoutes);

app.use(errorMiddleware);

export default app;
