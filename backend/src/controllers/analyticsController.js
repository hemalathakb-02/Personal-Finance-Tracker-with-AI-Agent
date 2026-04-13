const { getAllTransactions } = require("../data/store");

const buildMetrics = async (userId) => {
  const transactions = await getAllTransactions(userId);
  const income = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expense = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const savings = income - expense;

  const categories = Object.values(
    transactions
      .filter((tx) => tx.type === "expense")
      .reduce((acc, tx) => {
        if (!acc[tx.category]) acc[tx.category] = { category: tx.category, total: 0 };
        acc[tx.category].total += tx.amount;
        return acc;
      }, {})
  ).sort((a, b) => b.total - a.total);

  const trends = Object.values(
    transactions.reduce((acc, tx) => {
      const month = new Date(tx.date).toISOString().slice(0, 7);
      if (!acc[month]) acc[month] = { month, income: 0, expense: 0 };
      acc[month][tx.type] += tx.amount;
      return acc;
    }, {})
  ).sort((a, b) => a.month.localeCompare(b.month));

  return { income, expense, savings, balance: savings, categories, trends, count: transactions.length };
};

const getAnalyticsSummary = async (req, res) => {
  const data = await buildMetrics(req.user.userId);
  res.json({
    balance: data.balance,
    income: data.income,
    expense: data.expense,
    savings: data.savings,
    count: data.count,
  });
};

const getAnalyticsCategories = async (req, res) => {
  const data = await buildMetrics(req.user.userId);
  res.json(data.categories);
};

const getAnalyticsTrends = async (req, res) => {
  const data = await buildMetrics(req.user.userId);
  res.json(data.trends);
};

module.exports = { getAnalyticsSummary, getAnalyticsCategories, getAnalyticsTrends, buildMetrics };
