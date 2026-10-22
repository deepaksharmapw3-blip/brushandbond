const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication token missing or invalid format (Bearer token required)",
    });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    return res.status(503).json({
      success: false,
      message: "Admin authentication is not configured securely",
    });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid, expired, or corrupted token",
    });
  }
};

module.exports = authMiddleware;
