const prisma = require("../core/prisma");

function list({ where, skip, take }) {
  return prisma.transaction.findMany({
    where,
    skip,
    take,
    orderBy: { date: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
}

function count(where) {
  return prisma.transaction.count({ where });
}

function findById(id) {
  return prisma.transaction.findFirst({
    where: {
      id,
      isDeleted: false
    },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
}

function create(data) {
  return prisma.transaction.create({ data });
}

function update(id, data) {
  return prisma.transaction.update({
    where: { id },
    data
  });
}

module.exports = {
  list,
  count,
  findById,
  create,
  update
};
