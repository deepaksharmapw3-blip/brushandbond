const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      return res.status(503).json({
        success: false,
        message: "Admin authentication is not configured securely",
      });
    }
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      secret,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
      });
    }

    res.json({
      success: true,
      admin,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
};
