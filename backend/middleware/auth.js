const jwt = require("jsonwebtoken");

/**
 * authenticate — JWT verification middleware.
 *
 * Reads the token from the Authorization header:
 *   Authorization: Bearer <token>
 *
 * On success, attaches { id, role } to req.user and calls next().
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      if (process.env.NODE_ENV === "development") {
        // In development mode, auto-login as temple_admin so the frontend can function without auth UI
        req.user = {
          id: "dev-admin-id",
          role: "temple_admin",
        };
        return next();
      }
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/**
 * requireRole — Role-based authorization middleware factory.
 *
 * Usage:
 *   router.get("/admin-only", authenticate, requireRole("temple_admin"), handler);
 *   router.get("/staff",      authenticate, requireRole("temple_admin", "police"), handler);
 *
 * Must be used AFTER authenticate middleware so that req.user.role exists.
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }
    next();
  };
};

module.exports = { authenticate, requireRole };
