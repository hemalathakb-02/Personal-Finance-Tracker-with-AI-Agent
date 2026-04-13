const express = require("express");
const {
  getTransactions,
  createTransaction,
  editTransaction,
  deleteTransaction,
  getSummary,
  getInsights,
} = require("../controllers/transactionController");

const router = express.Router();

router.get("/", getTransactions);
router.post("/", createTransaction);
router.put("/:id", editTransaction);
router.delete("/:id", deleteTransaction);
router.get("/summary/overview", getSummary);
router.get("/insights", getInsights);

module.exports = router;
