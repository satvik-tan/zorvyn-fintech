const userModel = require("../models/userModel");
const { httpError } = require("../utils/httpError");

function parseBoolean(value) {
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  return undefined;
}

function toPagination(page, limit) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.max(Number(limit) || 10, 1);
  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
    take: safeLimit
  };
}

async function listUsers({ page, limit, role, isActive }) {
  const pagination = toPagination(page, limit);
  const parsedActive = parseBoolean(isActive);

  const where = {
    ...(role ? { role } : {}),
    ...(parsedActive !== undefined ? { isActive: parsedActive } : {})
  };

  const [rows, total] = await Promise.all([
    userModel.list({ where, skip: pagination.skip, take: pagination.take }),
    userModel.count(where)
  ]);

  return {
    rows,
    total,
    page: pagination.page,
    limit: pagination.limit
  };
}

async function getUserById(id) {
  const user = await userModel.findById(id);
  if (!user) {
    throw httpError("User not found", 404);
  }
  return user;
}

async function updateUser(id, data) {
  try {
    return await userModel.update(id, data);
  } catch (err) {
    if (err.code === "P2025") {
      throw httpError("User not found", 404);
    }
    throw err;
  }
}

async function deactivateUser(id, currentUserId) {
  if (id === currentUserId) {
    throw httpError("Admin cannot deactivate themselves", 400);
  }

  try {
    await userModel.update(id, { isActive: false });
  } catch (err) {
    if (err.code === "P2025") {
      throw httpError("User not found", 404);
    }
    throw err;
  }
}

module.exports = {
  listUsers,
  getUserById,
  updateUser,
  deactivateUser
};
