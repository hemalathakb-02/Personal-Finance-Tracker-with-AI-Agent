const express = require("express");
const { postAiChat } = require("../controllers/aiController");

const router = express.Router();

router.post("/chat", postAiChat);

module.exports = router;
