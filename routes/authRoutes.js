import express from "express";
// import authController from "../controllers/authController.js";

const router = express.Router();

// router.post("/register", authController.register);
// router.post("/login", authController.login);

router.get("/register", (req, res) => {
  res.status(200).json({ message: "Estamos en register" });
});

router.get("/login", (req, res) => {
  res.status(200).json({ message: "Estamos en login" });
});

export default router;
