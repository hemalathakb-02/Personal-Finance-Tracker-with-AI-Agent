const express = require("express");
const {
  createAgentExpense,
  getExpensesByMobile,
  changeExpenseDate,
  deleteAgentExpense,
  getAgentExpenseAnalytics,
} = require("../controllers/agentExpenseController");

const router = express.Router();

router.post("/", createAgentExpense);
router.get("/", getExpensesByMobile);
router.put("/:id/date", changeExpenseDate);
router.delete("/:id", deleteAgentExpense);
router.get("/analytics/view", getAgentExpenseAnalytics);

module.exports = router;
