const {
  createExpense,
  getByMobile,
  getAllByUser,
  updateExpenseDate,
  deleteExpense,
} = require("../data/agentExpenseStore");

const FULL_NAME_RE = /^\S+\s+\S+.*$/;
const DATE_RE = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
const PHONE_RE = /^\+\d{1,3}\d{10}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validatePayload = (body) => {
  const errors = [];
  if (!body.fullName || !FULL_NAME_RE.test(body.fullName)) errors.push("Full name must include first and last name.");
  if (!["Debit Card", "Credit Card"].includes(body.cardType)) errors.push("Card type must be Debit Card or Credit Card.");
  if (!["Transport", "Shopping", "Food"].includes(body.category)) errors.push("Category must be Transport, Shopping, or Food.");
  if (body.amount === undefined || Number.isNaN(Number(body.amount))) errors.push("Amount must be numeric.");
  if (!body.description) errors.push("Expense description is required.");
  if (!body.date || !DATE_RE.test(body.date)) errors.push("Date must be DD-MM-YYYY.");
  if (!body.contactNumber || !PHONE_RE.test(body.contactNumber)) errors.push("Contact number must include country code and 10 digits.");
  if (!body.email || !EMAIL_RE.test(body.email)) errors.push("Valid email is required.");
  return errors;
};

const createAgentExpense = async (req, res) => {
  const errors = validatePayload(req.body);
  if (errors.length) return res.status(400).json({ message: "Validation failed", errors });

  const saved = await createExpense({
    userId: req.user.userId,
    fullName: req.body.fullName.trim(),
    cardType: req.body.cardType,
    category: req.body.category,
    amount: Number(req.body.amount),
    description: req.body.description.trim(),
    date: req.body.date,
    contactNumber: req.body.contactNumber.trim(),
    email: req.body.email.trim().toLowerCase(),
  });
  return res.status(201).json(saved);
};

const getExpensesByMobile = async (req, res) => {
  const mobile = req.query.mobile;
  if (!mobile || !PHONE_RE.test(mobile)) {
    return res.status(400).json({ message: "Provide mobile in format +<countrycode><10digits>." });
  }
  const records = await getByMobile(req.user.userId, mobile);
  if (!records.length) return res.status(404).json({ message: "No expenses found for this mobile number." });
  return res.json(records);
};

const changeExpenseDate = async (req, res) => {
  const { date } = req.body;
  if (!date || !DATE_RE.test(date)) return res.status(400).json({ message: "Date must be DD-MM-YYYY." });
  const updated = await updateExpenseDate(req.user.userId, req.params.id, date);
  if (!updated) return res.status(404).json({ message: "Expense not found." });
  return res.json(updated);
};

const deleteAgentExpense = async (req, res) => {
  const deleted = await deleteExpense(req.user.userId, req.params.id);
  if (!deleted) return res.status(404).json({ message: "Expense not found." });
  return res.json({ message: "Expense deleted successfully." });
};

const getAgentExpenseAnalytics = async (req, res) => {
  const records = await getAllByUser(req.user.userId);
  const byCategory = Object.values(
    records.reduce((acc, r) => {
      if (!acc[r.category]) acc[r.category] = { category: r.category, total: 0 };
      acc[r.category].total += Number(r.amount);
      return acc;
    }, {})
  );
  const thisMonthKey = new Date().toISOString().slice(3, 7); // MM-YYYY from DD-MM-YYYY
  const totalThisMonth = records
    .filter((r) => String(r.date).slice(3) === thisMonthKey)
    .reduce((sum, r) => sum + Number(r.amount), 0);
  const last5 = [...records].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  return res.json({ byCategory, totalThisMonth, last5 });
};

module.exports = {
  createAgentExpense,
  getExpensesByMobile,
  changeExpenseDate,
  deleteAgentExpense,
  getAgentExpenseAnalytics,
};
