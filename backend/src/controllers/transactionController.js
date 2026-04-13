const {
  getAllTransactions,
  addTransaction,
  updateTransaction,
  removeTransaction,
} = require("../data/store");

const getTransactions = async (req, res) => {
  const { category, type, startDate, endDate } = req.query;
  let transactions = await getAllTransactions(req.user.userId);

  if (category) {
    transactions = transactions.filter((tx) =>
      tx.category.toLowerCase().includes(String(category).toLowerCase())
    );
  }
  if (type) {
    transactions = transactions.filter((tx) => tx.type === type);
  }
  if (startDate) {
    transactions = transactions.filter((tx) => new Date(tx.date) >= new Date(startDate));
  }
  if (endDate) {
    transactions = transactions.filter((tx) => new Date(tx.date) <= new Date(endDate));
  }

  res.json(transactions);
};

const createTransaction = async (req, res) => {
  const { amount, type, category, date, notes } = req.body;

  if (amount === undefined || !type || !category || !date) {
    return res.status(400).json({ message: "Please provide all required fields." });
  }

  if (!["income", "expense"].includes(type)) {
    return res.status(400).json({ message: "Type must be income or expense." });
  }

  const transaction = await addTransaction({
    userId: req.user.userId,
    amount: Number(amount),
    type,
    category: String(category).toLowerCase(),
    date,
    notes: notes || "",
  });

  res.status(201).json(transaction);
};

const editTransaction = async (req, res) => {
  const { amount, type, category, date, notes } = req.body;
  const updates = {};

  if (amount !== undefined) updates.amount = Number(amount);
  if (type) {
    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Type must be income or expense." });
    }
    updates.type = type;
  }
  if (category) updates.category = String(category).toLowerCase();
  if (date) updates.date = date;
  if (notes !== undefined) updates.notes = notes;

  const updated = await updateTransaction(req.params.id, req.user.userId, updates);
  if (!updated) {
    return res.status(404).json({ message: "Transaction not found." });
  }

  res.json(updated);
};

const deleteTransaction = async (req, res) => {
  const transaction = await removeTransaction(req.params.id, req.user.userId);
  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found." });
  }
  res.json({ message: "Transaction deleted." });
};

const getSummary = async (req, res) => {
  const transactions = await getAllTransactions(req.user.userId);

  const totals = transactions.reduce(
    (acc, tx) => {
      if (tx.type === "income") acc.income += tx.amount;
      if (tx.type === "expense") acc.expense += tx.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const categoryMap = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((acc, tx) => {
      if (!acc[tx.category]) {
        acc[tx.category] = { category: tx.category, total: 0 };
      }
      acc[tx.category].total += tx.amount;
      return acc;
    }, {});

  const breakdown = transactions.reduce((acc, tx) => {
    if (!acc[tx.type]) {
      acc[tx.type] = 0;
    }
    acc[tx.type] += tx.amount;
    return acc;
  }, {});
  const categories = Object.values(categoryMap).sort((a, b) => b.total - a.total);
  const monthlyMap = transactions.reduce((acc, tx) => {
    const month = new Date(tx.date).toISOString().slice(0, 7);
    if (!acc[month]) acc[month] = { month, income: 0, expense: 0 };
    acc[month][tx.type] += tx.amount;
    return acc;
  }, {});
  const monthly = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

  res.json({
    income: totals.income,
    expense: totals.expense,
    balance: totals.income - totals.expense,
    breakdown: [
      { name: "income", value: breakdown.income || 0 },
      { name: "expense", value: breakdown.expense || 0 },
    ],
    categories,
    monthly,
    count: transactions.length,
  });
};

const getInsights = async (req, res) => {
  const transactions = await getAllTransactions(req.user.userId);
  const income = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expense = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const foodExpense = transactions
    .filter((tx) => tx.type === "expense" && tx.category.toLowerCase() === "food")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const highestCategory = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});
  const topCategory = Object.entries(highestCategory).sort((a, b) => b[1] - a[1])[0];

  const insights = [];
  if (expense > income) insights.push("You are overspending");
  if (topCategory && expense > 0) {
    const pct = ((topCategory[1] / expense) * 100).toFixed(0);
    insights.push(`You spent ${pct}% on ${topCategory[0]} this month`);
  }
  if (foodExpense > 0 && expense > 0 && foodExpense / expense > 0.35) {
    insights.push("Reduce food spending");
  }
  insights.push("Try reducing unnecessary expenses and set a monthly budget goal.");
  if (insights.length === 0) {
    insights.push("Your spending pattern looks balanced");
  }

  res.json({ insights });
};

module.exports = {
  getTransactions,
  createTransaction,
  editTransaction,
  deleteTransaction,
  getSummary,
  getInsights,
};
