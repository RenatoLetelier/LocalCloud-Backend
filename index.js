import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import apiRoutes from "./routes/routes.js";

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("Home Page! Api working correctly.");
});

app.use((req, res) => {
  res.status(404).send("Ups! Page not found.");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
