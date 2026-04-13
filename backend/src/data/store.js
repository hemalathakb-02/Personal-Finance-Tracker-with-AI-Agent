const Transaction = require("../models/Transaction");

const sampleTransactions = [
  {
    userId: "demo-seed",
    amount: 50000,
    type: "income",
    category: "salary",
    date: new Date("2026-04-01"),
    notes: "Monthly salary credited",
  },
  {
    userId: "demo-seed",
    amount: 1200,
    type: "expense",
    category: "food",
    date: new Date("2026-04-02"),
    notes: "Groceries",
  },
  {
    userId: "demo-seed",
    amount: 2000,
    type: "expense",
    category: "transport",
    date: new Date("2026-04-03"),
    notes: "Cab and fuel",
  },
];

const inMemoryTransactions = [];

const normalize = (tx) => ({
  _id: tx._id ? String(tx._id) : `mem-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  userId: tx.userId,
  amount: Number(tx.amount),
  type: tx.type,
  category: tx.category,
  date: new Date(tx.date),
  notes: tx.notes || "",
});

const isMongoReady = () => !!process.env.MONGO_CONNECTED;

const ensureSeedData = async (userId) => {
  if (isMongoReady()) {
    const count = await Transaction.countDocuments({ userId });
    if (count === 0) {
      await Transaction.insertMany(sampleTransactions.map((tx) => ({ ...tx, userId })));
    }
    return;
  }

  const hasUserData = inMemoryTransactions.some((tx) => tx.userId === userId);
  if (!hasUserData) {
    inMemoryTransactions.push(...sampleTransactions.map((tx) => normalize({ ...tx, userId })));
  }
};

const getAllTransactions = async (userId) => {
  if (isMongoReady()) {
    return Transaction.find({ userId }).sort({ date: -1, createdAt: -1 });
  }

  return [...inMemoryTransactions]
    .filter((tx) => tx.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

const addTransaction = async (payload) => {
  if (isMongoReady()) {
    return Transaction.create(payload);
  }

  const tx = normalize(payload);
  inMemoryTransactions.unshift(tx);
  return tx;
};

const updateTransaction = async (id, userId, updates) => {
  if (isMongoReady()) {
    return Transaction.findOneAndUpdate({ _id: id, userId }, updates, {
      new: true,
      runValidators: true,
    });
  }

  const index = inMemoryTransactions.findIndex((tx) => tx._id === id && tx.userId === userId);
  if (index === -1) return null;

  const current = inMemoryTransactions[index];
  inMemoryTransactions[index] = normalize({
    ...current,
    ...updates,
    _id: current._id,
    userId: current.userId,
  });
  return inMemoryTransactions[index];
};

const removeTransaction = async (id, userId) => {
  if (isMongoReady()) {
    const tx = await Transaction.findOne({ _id: id, userId });
    if (!tx) return null;
    await tx.deleteOne();
    return tx;
  }

  const index = inMemoryTransactions.findIndex((tx) => tx._id === id && tx.userId === userId);
  if (index === -1) return null;
  const [deleted] = inMemoryTransactions.splice(index, 1);
  return deleted;
};

module.exports = {
  ensureSeedData,
  getAllTransactions,
  addTransaction,
  updateTransaction,
  removeTransaction,
};
