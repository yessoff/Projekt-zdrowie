// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Brak tokenu (Bearer ...)" });
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ obsłuż różne nazwy pola z userId w tokenie
    const uid = payload.userId || payload.id || payload._id || payload.sub;

    if (!uid) {
      console.error("JWT payload without user id:", payload);
      return res.status(401).json({ error: "Token nie zawiera userId" });
    }

    req.userId = uid;
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    return res.status(401).json({ error: "Nieprawidłowy token" });
  }
};
