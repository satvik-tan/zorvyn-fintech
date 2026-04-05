const jwt = require("jsonwebtoken");
const prisma = require("../core/prisma");
const { JWT_SECRET, PERMISSIONS } = require("../core/config");

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function authenticate(req, res, next) {
  try {
    const authHeader = (req.headers.authorization || "").trim();
    let token = authHeader;

    // Accept both "Bearer <token>" and raw token, and tolerate accidental double Bearer prefix.
    token = token.replace(/^Bearer\s+/i, "").trim();
    token = token.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      throw createError("Authentication required. Use Authorization: Bearer <token>", 401);
    }

    let payload;

    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw createError("Invalid or expired token", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user || !user.isActive) {
      throw createError("User is not authorized", 401);
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

function authorize(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError("Authentication required", 401));
    }

    const roleKey = String(req.user.role || "").toLowerCase();
    const allowed = PERMISSIONS[roleKey] || [];

    if (!allowed.includes(permission)) {
      return next(createError("Forbidden", 403));
    }

    return next();
  };
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError("Authentication required", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError("Forbidden", 403));
    }

    return next();
  };
}

module.exports = {
  authenticate,
  authorize,
  requireRole
};
