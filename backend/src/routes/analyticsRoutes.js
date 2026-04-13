const express = require("express");
const {
  getAnalyticsSummary,
  getAnalyticsCategories,
  getAnalyticsTrends,
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/summary", getAnalyticsSummary);
router.get("/categories", getAnalyticsCategories);
router.get("/trends", getAnalyticsTrends);

module.exports = router;
