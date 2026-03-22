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
import userMediaRoutes from "./src/modules/userMedia/userMedia.routes.js";
import albumRoutes from "./src/modules/albums/album.routes.js";

import { getHealth } from "./src/modules/media/media.controller.js";
import { streamPhoto } from "./src/modules/photos/photo.controller.js";
import { streamVideo } from "./src/modules/videos/video.controller.js";

const app = express();

app.use(cors());
app.use(express.json());

// Public
app.get("/", (req, res) => res.send("Api working correctly"));
app.use("/api/auth", authRoutes);
app.get("/api/health", getHealth);
app.get("/api/photos/:id/stream", streamPhoto);
app.get("/api/videos/:id/stream/*splat", streamVideo);

// Protected
app.use("/api/users", requireAuth, userRoutes);
app.use("/api/photos", requireAuth, photoRoutes);
app.use("/api/videos", requireAuth, videoRoutes);
app.use("/api/media", requireAuth, mediaRoutes);
app.use("/api/tunnel", requireAuth, tunnelRoutes);
app.use("/api/user-media", requireAuth, userMediaRoutes);
app.use("/api/albums", requireAuth, albumRoutes);

app.use(errorMiddleware);

export default app;
