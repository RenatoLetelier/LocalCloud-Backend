import express from "express";
const router = express.Router();

// const authRoutes = require("./routes/authRoutes");

// router.use("/auth", authRoutes);
router.use("/auth", (req, res) => {
  res.send("Auth routes are not implemented yet.");
});

export default router;
