const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const { JWT_SECRET, JWT_EXPIRES_IN, ROLES } = require("../core/config");
const { httpError } = require("../utils/httpError");

function signToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

async function register({ name, email, password, role }) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    if (role && existing.role !== role) {
      const updated = await userModel.update(existing.id, { role });
      return {
        user: updated,
        token: signToken(updated),
        message: "Existing user role updated"
      };
    }

    throw httpError("Email already in use", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await userModel.create({
    name,
    email,
    password: passwordHash,
    role: role || ROLES.VIEWER
  });

  return {
    user: created,
    token: signToken(created)
  };
}

async function login({ email, password }) {
  const user = await userModel.findByEmail(email);

  if (!user || !user.isActive) {
    throw httpError("Invalid credentials", 401);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw httpError("Invalid credentials", 401);
  }

  if (user.role !== ROLES.ADMIN) {
    throw httpError("Only admin users can log in", 403);
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  return {
    user: safeUser,
    token: signToken(safeUser)
  };
}

module.exports = {
  register,
  login
};
