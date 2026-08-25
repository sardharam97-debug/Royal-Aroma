const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ message: "Please enter your full name." });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "This email is already registered. Please login." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role: "user"
    });

    res.status(201).json({
      message: "Account created successfully. Please login.",
      user: publicUser(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "This email is already registered." });
    }
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = createToken(user);
    res.json({
      message: "Login successful.",
      token,
      user: publicUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

// POST /api/auth/logout
router.post("/logout", protect, (req, res) => {
  res.json({ message: "Logged out successfully." });
});

// GET /api/auth/me
router.get("/me", protect, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// GET /api/auth/users  (admin only)
router.get("/users", protect, adminOnly, async (req, res) => {
  const users = await User.find({ role: { $ne: "admin" } })
    .select("-password")
    .sort({ createdAt: -1 });
  res.json({ users });
});

module.exports = router;
