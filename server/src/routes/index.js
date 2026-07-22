const express = require("express");

const router = express.Router();

router.get("/health", (_req, res) => { res.json({ message: "API is healthy 🍋", status: "running" })});

module.exports = router;
