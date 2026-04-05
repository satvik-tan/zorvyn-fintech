const dotenv = require("dotenv");

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_here";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const ROLES = {
  VIEWER: "VIEWER",
  ANALYST: "ANALYST",
  ADMIN: "ADMIN"
};

const PERMISSIONS = {
  viewer: ["read:transactions", "read:dashboard"],
  analyst: ["read:transactions", "read:dashboard", "read:insights", "write:transactions"],
  admin: [
    "read:transactions",
    "read:dashboard",
    "read:insights",
    "write:transactions",
    "delete:transactions",
    "manage:users"
  ]
};

module.exports = {
  PORT,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  ROLES,
  PERMISSIONS
};
