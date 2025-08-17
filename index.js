import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import apiRoutes from "./routes.js";

dotenv.config();
const PORT = process.env.BACK_PORT || 3000;
const FRONT_URL = `${process.env.FRONT_ROOT}:${process.env.FRONT_PORT}`;

const app = express();

app.use(cors({ origin: [FRONT_URL], credentials: true }));
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
