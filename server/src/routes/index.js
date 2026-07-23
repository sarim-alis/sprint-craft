const express = require("express");
const authRoutes = require("./authRoutes");

const router = express.Router();

router.get("/health", (_req, res) => { res.json({ message: "API is healthy 🍋", status: "running" })});
router.use("/auth", authRoutes);

module.exports = router;
