const AgentExpense = require("../models/AgentExpense");

const inMemoryExpenses = [];

const isMongoReady = () => !!process.env.MONGO_CONNECTED;

const normalize = (expense) => ({
  _id: expense._id
    ? String(expense._id)
    : `exp-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  userId: expense.userId,
  fullName: expense.fullName,
  cardType: expense.cardType,
  category: expense.category,
  amount: Number(expense.amount),
  description: expense.description,
  date: expense.date,
  contactNumber: expense.contactNumber,
  email: expense.email,
  createdAt: expense.createdAt || new Date(),
  updatedAt: expense.updatedAt || new Date(),
});

const createExpense = async (payload) => {
  if (isMongoReady()) return AgentExpense.create(payload);
  const item = normalize(payload);
  inMemoryExpenses.unshift(item);
  return item;
};

const getByMobile = async (userId, contactNumber) => {
  if (isMongoReady()) {
    return AgentExpense.find({ userId, contactNumber }).sort({ createdAt: -1 });
  }
  return inMemoryExpenses
    .filter((e) => e.userId === userId && e.contactNumber === contactNumber)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const getAllByUser = async (userId) => {
  if (isMongoReady()) return AgentExpense.find({ userId }).sort({ createdAt: -1 });
  return inMemoryExpenses
    .filter((e) => e.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const updateExpenseDate = async (userId, id, newDate) => {
  if (isMongoReady()) {
    return AgentExpense.findOneAndUpdate(
      { _id: id, userId },
      { date: newDate },
      { new: true, runValidators: true }
    );
  }
  const idx = inMemoryExpenses.findIndex((e) => e._id === id && e.userId === userId);
  if (idx === -1) return null;
  inMemoryExpenses[idx] = normalize({ ...inMemoryExpenses[idx], date: newDate, updatedAt: new Date() });
  return inMemoryExpenses[idx];
};

const deleteExpense = async (userId, id) => {
  if (isMongoReady()) {
    const found = await AgentExpense.findOne({ _id: id, userId });
    if (!found) return null;
    await found.deleteOne();
    return found;
  }
  const idx = inMemoryExpenses.findIndex((e) => e._id === id && e.userId === userId);
  if (idx === -1) return null;
  const [removed] = inMemoryExpenses.splice(idx, 1);
  return removed;
};

module.exports = {
  createExpense,
  getByMobile,
  getAllByUser,
  updateExpenseDate,
  deleteExpense,
};
