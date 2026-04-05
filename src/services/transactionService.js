const transactionModel = require("../models/transactionModel");
const prisma = require("../core/prisma");
const { httpError } = require("../utils/httpError");

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

function dateFilter(fromDate, toDate) {
  const filter = {};
  if (fromDate) {
    filter.gte = new Date(fromDate);
  }
  if (toDate) {
    filter.lte = new Date(toDate);
  }
  return Object.keys(filter).length ? filter : undefined;
}

async function listTransactions({ page, limit, type, category, from_date, to_date }) {
  const pagination = toPagination(page, limit);
  const dateRange = dateFilter(from_date, to_date);

  const where = {
    isDeleted: false,
    ...(type ? { type } : {}),
    ...(category ? { category } : {}),
    ...(dateRange ? { date: dateRange } : {})
  };

  const [rows, total] = await Promise.all([
    transactionModel.list({ where, skip: pagination.skip, take: pagination.take }),
    transactionModel.count(where)
  ]);

  return {
    rows,
    total,
    page: pagination.page,
    limit: pagination.limit
  };
}

async function getTransactionById(id) {
  const row = await transactionModel.findById(id);
  if (!row) {
    throw httpError("Transaction not found", 404);
  }
  return row;
}

async function createTransaction(data, userId) {
  const amount = Number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw httpError("Amount must be greater than zero", 400);
  }

  return transactionModel.create({
    userId,
    amount,
    type: data.type,
    category: data.category,
    date: new Date(data.date),
    notes: data.notes || null
  });
}

async function updateTransaction(id, data) {
  const existing = await prisma.transaction.findFirst({
    where: {
      id,
      isDeleted: false
    }
  });

  if (!existing) {
    throw httpError("Transaction not found", 404);
  }

  const updateData = {};
  if (data.amount !== undefined) {
    const parsed = Number(data.amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw httpError("Amount must be greater than zero", 400);
    }
    updateData.amount = parsed;
  }
  if (data.type !== undefined) updateData.type = data.type;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.date !== undefined) updateData.date = new Date(data.date);
  if (data.notes !== undefined) updateData.notes = data.notes || null;

  if (Object.keys(updateData).length === 0) {
    throw httpError(
      "At least one field is required to update: amount, type, category, date, notes",
      400
    );
  }

  return transactionModel.update(id, updateData);
}

async function deleteTransaction(id) {
  const existing = await prisma.transaction.findFirst({
    where: {
      id,
      isDeleted: false
    }
  });

  if (!existing) {
    throw httpError("Transaction not found", 404);
  }

  await transactionModel.update(id, { isDeleted: true });
}

module.exports = {
  listTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
