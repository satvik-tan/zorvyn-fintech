const prisma = require("../core/prisma");

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
};

function create(data) {
  return prisma.user.create({
    data,
    select: safeUserSelect
  });
}

function createWithPassword(data) {
  return prisma.user.create({ data });
}

function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

function findById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: safeUserSelect
  });
}

function list({ where, skip, take }) {
  return prisma.user.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: "desc" },
    select: safeUserSelect
  });
}

function count(where) {
  return prisma.user.count({ where });
}

function update(id, data) {
  return prisma.user.update({
    where: { id },
    data,
    select: safeUserSelect
  });
}

module.exports = {
  safeUserSelect,
  create,
  createWithPassword,
  findByEmail,
  findById,
  list,
  count,
  update
};
