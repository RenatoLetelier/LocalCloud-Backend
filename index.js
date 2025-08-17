import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import apiRoutes from "./routes.js";

dotenv.config();
const PORT = process.env.BACK_PORT || 3000;
const ALLOWED_URLS = [
  `${process.env.FRONT_DEV_ROOT}:${process.env.FRONT_PORT}`,
  `${process.env.FRONT_PROD_ROOT}`,
];

const app = express();

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || ALLOWED_URLS.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(`${process.env.BASE_PATH}`, apiRoutes);

app.get("/", (req, res) => {
  res.send("Home Page! Api working correctly.");
});

app.use((req, res) => {
  res.status(404).send("Ups! Page not found.");
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT http://localhost:${PORT}`);
});
