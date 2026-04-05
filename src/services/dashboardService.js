const { Prisma } = require("@prisma/client");
const prisma = require("../core/prisma");

function buildDateWhere({ from_date, to_date }) {
  const date = {};
  if (from_date) {
    date.gte = new Date(from_date);
  }
  if (to_date) {
    date.lte = new Date(to_date);
  }

  return {
    isDeleted: false,
    ...(Object.keys(date).length ? { date } : {})
  };
}

async function getSummary({ from_date, to_date }) {
  const where = buildDateWhere({ from_date, to_date });

  const [incomeAgg, expenseAgg, count] = await Promise.all([
    prisma.transaction.aggregate({
      where: { ...where, type: "INCOME" },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: { ...where, type: "EXPENSE" },
      _sum: { amount: true }
    }),
    prisma.transaction.count({ where })
  ]);

  const totalIncome = incomeAgg._sum.amount || 0;
  const totalExpenses = expenseAgg._sum.amount || 0;

  return {
    total_income: totalIncome,
    total_expenses: totalExpenses,
    net_balance: totalIncome - totalExpenses,
    transaction_count: count || 0
  };
}

async function getCategoryBreakdown({ type, from_date, to_date }) {
  const where = {
    ...buildDateWhere({ from_date, to_date }),
    ...(type ? { type } : {})
  };

  const grouped = await prisma.transaction.groupBy({
    by: ["category", "type"],
    where,
    _sum: { amount: true },
    _count: { _all: true },
    orderBy: {
      _sum: {
        amount: "desc"
      }
    }
  });

  const income = [];
  const expense = [];

  grouped.forEach((row) => {
    const payload = {
      category: row.category,
      total: row._sum.amount || 0,
      count: row._count._all || 0
    };

    if (row.type === "INCOME") {
      income.push(payload);
    } else {
      expense.push(payload);
    }
  });

  return { income, expense };
}

async function getMonthlyTrends({ months }) {
  const safeMonths = Math.min(Math.max(Number(months) || 6, 1), 24);
  const sinceDate = new Date();
  sinceDate.setMonth(sinceDate.getMonth() - safeMonths + 1);
  sinceDate.setDate(1);
  sinceDate.setHours(0, 0, 0, 0);

  const rows = await prisma.$queryRaw(
    Prisma.sql`
      SELECT
        to_char(date_trunc('month', "date"), 'YYYY-MM') AS month,
        COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS expenses,
        COUNT(*)::int AS count
      FROM "Transaction"
      WHERE "isDeleted" = false
        AND "date" >= ${sinceDate}
      GROUP BY date_trunc('month', "date")
      ORDER BY date_trunc('month', "date") ASC
    `
  );

  return rows.map((row) => {
    const income = Number(row.income || 0);
    const expenses = Number(row.expenses || 0);
    return {
      month: row.month,
      income,
      expenses,
      net: income - expenses,
      count: Number(row.count || 0)
    };
  });
}

async function getRecentActivity({ limit }) {
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

  return prisma.transaction.findMany({
    where: { isDeleted: false },
    take: safeLimit,
    orderBy: { createdAt: "desc" },
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

async function getFullSnapshot(filters) {
  const [summary, category_breakdown, monthly_trends, recent_activity] = await Promise.all([
    getSummary(filters),
    getCategoryBreakdown(filters),
    getMonthlyTrends({ months: filters.months }),
    getRecentActivity({ limit: filters.limit })
  ]);

  return {
    summary,
    category_breakdown,
    monthly_trends,
    recent_activity
  };
}

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentActivity,
  getFullSnapshot
};
