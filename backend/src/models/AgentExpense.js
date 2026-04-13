const mongoose = require("mongoose");

const agentExpenseSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    cardType: { type: String, enum: ["Debit Card", "Credit Card"], required: true },
    category: { type: String, enum: ["Transport", "Shopping", "Food"], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AgentExpense", agentExpenseSchema);
