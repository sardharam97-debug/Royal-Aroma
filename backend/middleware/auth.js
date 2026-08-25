const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Reads the Bearer token and attaches the logged-in user to req.user
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Please login to continue." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found. Please login again." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Session expired. Please login again." });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only." });
  }
  next();
}

module.exports = { protect, adminOnly };
