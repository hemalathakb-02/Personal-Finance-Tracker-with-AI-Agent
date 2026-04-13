const { getAllTransactions } = require("../data/store");

const postAiChat = async (req, res) => {
  const { message } = req.body;
  const transactions = await getAllTransactions(req.user.userId);

  const income = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expense = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const categoryMap = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});
  const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];

  const insights = [];
  if (expense > income) insights.push("You are overspending. Try reducing non-essential purchases.");
  if (topCategory) insights.push(`Your highest spending category is ${topCategory[0]}.`);
  insights.push("Try a 50/30/20 rule: needs/wants/savings for better control.");
  insights.push("Increase savings by setting a fixed transfer right after salary credit.");

  res.json({
    reply: `AI Assistant: ${insights.slice(0, 3).join(" ")}`,
    context: {
      asked: message || "",
      income,
      expense,
      topCategory: topCategory ? topCategory[0] : null,
    },
  });
};

module.exports = { postAiChat };
