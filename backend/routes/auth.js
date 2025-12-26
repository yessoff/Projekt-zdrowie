const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const makeToken = (user) => {
  const payload = { userId: user._id, email: user.email };
  const secret = process.env.JWT_SECRET || "dev-secret";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

const userSafe = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  age: u.age,
  sex: u.sex,
});

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, age, sex } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Imię, email i hasło są wymagane" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ error: "Użytkownik z takim emailem już istnieje" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      age: age || undefined,
      sex: sex || "Inne",
    });

    const token = makeToken(user);
    res.json({ token, user: userSafe(user) });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Błąd serwera przy rejestracji" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Podaj email i hasło" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Nieprawidłowy email lub hasło" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(400).json({ error: "Nieprawidłowy email lub hasło" });
    }

    const token = makeToken(user);
    res.json({ token, user: userSafe(user) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Błąd serwera przy logowaniu" });
  }
});

module.exports = router;
