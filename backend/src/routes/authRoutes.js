const express = require("express");
const jwt = require("jsonwebtoken");
const { authenticateUser, createUser } = require("../data/userStore");

const router = express.Router();

const buildToken = (user) =>
  jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET || "dev-secret-key",
    { expiresIn: "1d" }
  );

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required." });
  }

  const created = await createUser({ name, email, password });
  if (created.error) {
    return res.status(409).json({ message: created.error });
  }

  const token = buildToken(created.user);
  return res.status(201).json({ token, user: created.user });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await authenticateUser({ email, password });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = buildToken(user);

  res.json({
    token,
    user,
  });
});

module.exports = router;
