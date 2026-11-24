const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const { isMySQLConnected, mysqlGetUserById } = require("../config/mysql");

// Protect routes - verifies JWT token across MySQL, MongoDB, and Dev Mode
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route, token missing",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "ecommerce_secret_key_123456"
    );

    let user = null;

    // 1. Try MySQL if connected
    if (isMySQLConnected()) {
      try {
        user = await mysqlGetUserById(decoded.id);
      } catch (err) {
        // continue
      }
    }

    // 2. Try MongoDB if connected
    if (!user && mongoose.connection.readyState === 1) {
      try {
        user = await User.findById(decoded.id);
      } catch (err) {
        // continue
      }
    }

    // 3. Fallback to valid decoded token payload
    if (!user && decoded && decoded.id) {
      user = {
        _id: String(decoded.id),
        id: String(decoded.id),
        name: decoded.name || "Store Admin",
        email: decoded.email || "admin@ecostore.com",
        role: decoded.role || "admin",
        isActive: true,
      };
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found with this token",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Grant access to specific roles (e.g. admin)
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required for this action",
    });
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
};
