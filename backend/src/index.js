const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const transactionRoutes = require("./routes/transactionRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const aiRoutes = require("./routes/aiRoutes");
const agentExpenseRoutes = require("./routes/agentExpenseRoutes");
const authRoutes = require("./routes/authRoutes");
const { ensureSeedData } = require("./data/store");
const { ensureDemoUser } = require("./data/userStore");
const { protect } = require("./middleware/authMiddleware");
const { getSummary, getInsights } = require("./controllers/transactionController");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    storage: process.env.MONGO_CONNECTED ? "mongodb" : "in-memory",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", protect, transactionRoutes);
app.use("/api/agent-expenses", protect, agentExpenseRoutes);
app.get("/api/summary", protect, getSummary);
app.get("/api/insights", protect, getInsights);
app.use("/api/analytics", protect, analyticsRoutes);
app.use("/api/ai", protect, aiRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

const start = async () => {
  const mongoConnected = await connectDB();
  process.env.MONGO_CONNECTED = mongoConnected ? "true" : "";
  const demoUser = await ensureDemoUser();
  await ensureSeedData(demoUser.id);

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

start();
