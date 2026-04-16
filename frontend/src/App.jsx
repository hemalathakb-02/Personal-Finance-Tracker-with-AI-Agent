import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  Bell,
  CircleDollarSign,
  Download,
  LayoutDashboard,
  LogOut,
  Moon,
  PencilLine,
  Sparkles,
  Sun,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserCircle2,
  Wallet,
} from "lucide-react";
import {
  createTransaction,
  deleteTransaction,
  getCategoriesAnalytics,
  getFilteredTransactions,
  getInsights,
  getSummary,
  getTrendsAnalytics,
  loginUser,
  signupUser,
  updateTransaction,
} from "./api";
import loginFintechBg from "./assets/login-fintech-bg.svg";
import ExpenseAgent from "./components/ExpenseAgent";

const CATEGORIES = ["food", "travel", "bills", "shopping", "salary", "other"];
const CATEGORY_COLORS = {
  food: "bg-orange-400/20 text-orange-200",
  travel: "bg-sky-400/20 text-sky-200",
  bills: "bg-red-400/20 text-red-200",
  shopping: "bg-fuchsia-400/20 text-fuchsia-200",
  salary: "bg-emerald-400/20 text-emerald-200",
  other: "bg-slate-400/20 text-slate-200",
};

const initialForm = { amount: "", type: "expense", category: "food", date: "", notes: "" };
const formatCurrency = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(v || 0);

const BASE_ALERTS = [
  {
    id: "security-login",
    title: "Security Alert",
    message: "New login detected from an unfamiliar device. Please verify activity.",
    type: "fraud",
  },
  {
    id: "fraud-transfer",
    title: "Fraud Alert",
    message: "High-value outgoing transaction flagged. Confirm if this payment is yours.",
    type: "fraud",
  },
  {
    id: "spend-warning",
    title: "Spending Alert",
    message: "Your dining and shopping spend is higher than usual this week.",
    type: "warning",
  },
  {
    id: "bill-reminder",
    title: "Bill Reminder",
    message: "Electricity bill due in 2 days. Set auto-pay to avoid late charges.",
    type: "info",
  },
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/20 bg-slate-900/90 px-3 py-2 text-xs text-slate-100 shadow-xl backdrop-blur-xl">
      {label && <p className="mb-1 text-slate-300">{label}</p>}
      {payload.map((item) => (
        <p key={item.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
          {item.name}: {formatCurrency(item.value)}
        </p>
      ))}
    </div>
  );
}

function LoginView({ onLogin, theme }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@finance.com");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = isSignup
        ? await signupUser({ name: name.trim(), email, password })
        : await loginUser({ email, password });
      localStorage.setItem("finance_token", data.token);
      localStorage.setItem("finance_user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err?.response?.data?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`relative flex min-h-screen items-center justify-center overflow-hidden p-4 ${
        theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"
      }`}
    >
      <img
        src={loginFintechBg}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-80"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,_rgba(56,189,248,0.22),_transparent_28%),radial-gradient(circle_at_85%_18%,_rgba(99,102,241,0.25),_transparent_30%),radial-gradient(circle_at_50%_100%,_rgba(16,185,129,0.2),_transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(148,163,184,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.2)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative grid w-full max-w-5xl gap-6 lg:grid-cols-2">
        <section
          className={`hidden rounded-3xl border p-7 shadow-2xl backdrop-blur-xl lg:block ${
            theme === "dark" ? "border-white/15 bg-white/10" : "border-slate-200/80 bg-white/70"
          }`}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Finance Intelligence</p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight">
            Professional personal banking dashboard
          </h2>
          <p className={`mt-4 text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
            Manage income, track expenses, monitor budgets, and receive AI-powered insights in one secure workspace.
          </p>
          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-3 py-2 text-sm">
              Income trend: Stable growth
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 px-3 py-2 text-sm">
              Budget monitor: Real-time tracking
            </div>
            <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-3 py-2 text-sm">
              Fraud monitor: Security shield active
            </div>
          </div>
        </section>

        <form
          onSubmit={submit}
          className={`relative w-full rounded-3xl border p-6 shadow-2xl backdrop-blur-xl ${
            theme === "dark" ? "border-white/15 bg-white/10" : "border-slate-200/70 bg-white/75"
          }`}
        >
        <h1 className="text-2xl font-bold">{isSignup ? "Create Account" : "Login"}</h1>
        <p className={`mt-2 text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
          Use demo login or create your own account.
        </p>
        {error && <p className="mt-3 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-100">{error}</p>}
        <div className="mt-4 space-y-3">
          {isSignup && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 placeholder:text-slate-400"
              placeholder="Full name"
              required
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 placeholder:text-slate-400"
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 placeholder:text-slate-400"
            placeholder="Password"
            required
          />
        </div>
        <button
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-3 py-2 font-medium text-white transition hover:scale-[1.01]"
        >
          {loading ? "Please wait..." : isSignup ? "Sign Up" : "Sign In"}
        </button>
        <button
          type="button"
          onClick={() => setIsSignup((prev) => !prev)}
          className="mt-3 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm"
        >
          {isSignup ? "Already have an account? Login" : "New user? Create account"}
        </button>
        </form>
      </div>
    </main>
  );
}

function Dashboard({ user, onLogout, theme, onToggleTheme }) {
  const [activePanel, setActivePanel] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
    breakdown: [],
    categories: [],
    monthly: [],
  });
  const [insights, setInsights] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState(() => Number(localStorage.getItem("monthly_budget")) || 0);
  const [dismissedAlertIds, setDismissedAlertIds] = useState(() => {
    const raw = localStorage.getItem("dismissed_alert_ids");
    return raw ? JSON.parse(raw) : [];
  });
  const [goals, setGoals] = useState(() => {
    const raw = localStorage.getItem("finance_goals");
    return raw ? JSON.parse(raw) : [];
  });
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [tx, sm, cat, tr, ai] = await Promise.all([
        getFilteredTransactions({
          category: filterCategory || undefined,
          type: filterType || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
        getSummary(),
        getCategoriesAnalytics(),
        getTrendsAnalytics(),
        getInsights(),
      ]);
      setTransactions(tx);
      setSummary({
        income: sm.income || 0,
        expense: sm.expense || 0,
        balance: sm.balance || 0,
        categories: cat || [],
        monthly: tr || [],
        breakdown: [
          { name: "income", value: sm.income || 0 },
          { name: "expense", value: sm.expense || 0 },
        ],
      });
      setInsights(ai.insights || []);
      setError("");
    } catch (err) {
      if (err?.response?.status === 401) return onLogout();
      setError("Backend not reachable. Start backend on port 4000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterCategory, filterType, startDate, endDate]);

  const budgetUsed = monthlyBudget > 0 ? (summary.expense / monthlyBudget) * 100 : 0;
  const notifications = useMemo(() => {
    const list = [];
    if (summary.expense > summary.income) list.push("Expenses crossed your income.");
    if (monthlyBudget > 0 && budgetUsed > 100) list.push("Monthly budget exceeded.");
    if (insights[0]) list.push(insights[0]);
    return list.slice(0, 3);
  }, [summary, monthlyBudget, budgetUsed, insights]);

  const alertItems = useMemo(() => {
    const items = [...BASE_ALERTS];

    if (summary.expense > summary.income) {
      items.unshift({
        id: "budget-risk",
        title: "Budget Risk",
        message: "Expenses are currently higher than income. Consider reducing non-essentials.",
        type: "warning",
      });
    }

    return items.filter((alert) => !dismissedAlertIds.includes(alert.id));
  }, [summary.expense, summary.income, dismissedAlertIds]);

  const dismissAlert = (id) => {
    setDismissedAlertIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };
  const markAllAlertsRead = () => {
    setDismissedAlertIds((prev) => [
      ...new Set([...prev, ...alertItems.map((a) => a.id)]),
    ]);
  };

  useEffect(() => {
    localStorage.setItem("dismissed_alert_ids", JSON.stringify(dismissedAlertIds));
  }, [dismissedAlertIds]);

  useEffect(() => {
    localStorage.setItem("finance_goals", JSON.stringify(goals));
  }, [goals]);

  const addGoal = () => {
    if (!newGoalName.trim() || !Number(newGoalTarget)) return;
    setGoals((prev) => [
      ...prev,
      {
        id: `goal-${Date.now()}`,
        name: newGoalName.trim(),
        target: Number(newGoalTarget),
        saved: 0,
      },
    ]);
    setNewGoalName("");
    setNewGoalTarget("");
  };

  const addToGoal = (id) => {
    const contribution = Math.max(summary.balance * 0.1, 500);
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, saved: Math.min(g.target, g.saved + contribution) } : g
      )
    );
  };

  const removeGoal = (id) => setGoals((prev) => prev.filter((g) => g.id !== id));

  const forecastRows = useMemo(() => {
    const monthly = summary.monthly || [];
    const avgNet = monthly.length
      ? monthly.reduce((acc, m) => acc + (m.income - m.expense), 0) / monthly.length
      : summary.income - summary.expense;
    const base = summary.balance || 0;
    return Array.from({ length: 3 }).map((_, idx) => ({
      month: `M+${idx + 1}`,
      projected: base + avgNet * (idx + 1),
    }));
  }, [summary]);

  const exportCSV = () => {
    const rows = [
      ["amount", "type", "category", "date", "notes"],
      ...transactions.map((t) => [t.amount, t.type, t.category, t.date, t.notes || ""]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "transactions.csv";
    link.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingId) await updateTransaction(editingId, { ...form, amount: Number(form.amount) });
      else await createTransaction({ ...form, amount: Number(form.amount) });
      setForm(initialForm);
      setEditingId("");
      setIsTxModalOpen(false);
      await loadData();
    } catch {
      setError("Unable to save transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  const beginEdit = (tx) => {
    setEditingId(tx._id);
    setIsTxModalOpen(true);
    setForm({
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      date: new Date(tx.date).toISOString().slice(0, 10),
      notes: tx.notes || "",
    });
  };

  const shellBg = theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900";
  const glass = theme === "dark" ? "border-white/15 bg-white/10" : "border-slate-200 bg-white/70";

  return (
    <main className={`relative min-h-screen overflow-hidden ${shellBg}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,_rgba(59,130,246,0.2),_transparent_35%),radial-gradient(circle_at_90%_15%,_rgba(139,92,246,0.2),_transparent_30%),radial-gradient(circle_at_50%_100%,_rgba(34,197,94,0.16),_transparent_30%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[240px_1fr]">
        <aside className={`rounded-3xl border p-4 shadow-2xl backdrop-blur-xl ${glass}`}>
          <h2 className="mb-4 text-lg font-bold">Finance OS</h2>
          <nav className="space-y-2 text-sm">
            <button
              onClick={() => setActivePanel("dashboard")}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left ${
                activePanel === "dashboard" ? "bg-white/15" : "bg-white/5"
              }`}
            >
              <LayoutDashboard size={16} /> Dashboard
            </button>
            <button
              onClick={() => setActivePanel("profile")}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left ${
                activePanel === "profile" ? "bg-white/15" : "bg-white/5"
              }`}
            >
              <UserCircle2 size={16} /> Profile
            </button>
            <button
              onClick={() => setActivePanel("notifications")}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left ${
                activePanel === "notifications" ? "bg-white/15" : "bg-white/5"
              }`}
            >
              <Bell size={16} /> Notifications
              {alertItems.length > 0 && (
                <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {alertItems.length}
                </span>
              )}
            </button>
          </nav>
          <div className="mt-6 space-y-2">
            <button
              onClick={onToggleTheme}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <button
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>

        <section className="space-y-4">
          {activePanel === "profile" && (
            <article className={`rounded-3xl border p-5 shadow-2xl backdrop-blur-xl ${glass}`}>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <UserCircle2 size={18} /> Profile Details
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs opacity-70">Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs opacity-70">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs opacity-70">Monthly Budget</p>
                  <p className="font-medium">{monthlyBudget ? formatCurrency(monthlyBudget) : "Not set"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs opacity-70">Account Status</p>
                  <p className="font-medium text-emerald-300">Active</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs opacity-70">Account Type</p>
                  <p className="font-medium">Savings Account</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs opacity-70">Masked Account Number</p>
                  <p className="font-medium">XXXX-XXXX-4521</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs opacity-70">KYC Status</p>
                  <p className="font-medium text-cyan-300">Verified</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs opacity-70">Last Login</p>
                  <p className="font-medium">{new Date().toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs opacity-70">Risk Score</p>
                  <p className="font-medium text-amber-300">Low</p>
                </div>
              </div>
            </article>
          )}

          {activePanel === "notifications" && (
            <article className={`rounded-3xl border p-5 shadow-2xl backdrop-blur-xl ${glass}`}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Bell size={18} /> Notifications Center
                </h3>
                {alertItems.length > 0 && (
                  <button
                    onClick={markAllAlertsRead}
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-xs"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {alertItems.length ? (
                  alertItems.map((alert) => (
                    <div
                      key={`${alert.title}-${alert.message}`}
                      className={`rounded-xl border p-3 text-sm ${
                        alert.type === "fraud"
                          ? "border-rose-400/30 bg-rose-500/15 text-rose-100"
                          : alert.type === "warning"
                            ? "border-amber-400/30 bg-amber-500/15 text-amber-100"
                            : "border-cyan-400/30 bg-cyan-500/15 text-cyan-100"
                      }`}
                    >
                      <p className="font-semibold">{alert.title}</p>
                      <p className="mt-1">{alert.message}</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="rounded-lg border border-white/30 bg-white/10 px-2 py-1 text-xs"
                        >
                          Mark as read
                        </button>
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="rounded-lg border border-white/30 bg-black/20 px-2 py-1 text-xs"
                        >
                          Resolve alert
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                    You are all caught up. No new notifications.
                  </div>
                )}
                {notifications.length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                    <p className="mb-1 font-semibold">Personalized Alerts</p>
                    {notifications.map((n) => (
                      <p key={n} className="text-xs opacity-90">
                        - {n}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </article>
          )}

          <header className={`rounded-3xl border p-5 shadow-2xl backdrop-blur-xl ${glass}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">AI Finance Tracker</h1>
                <p className={`${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>Welcome {user?.name}</p>
              </div>
              <button
                onClick={() => {
                  setEditingId("");
                  setForm(initialForm);
                  setIsTxModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02]"
              >
                + Add Transaction
              </button>
            </div>
          </header>

          {error && <div className="rounded-2xl bg-red-500/20 px-4 py-2 text-red-100">{error}</div>}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              { label: "Balance", value: summary.balance, icon: Wallet, cls: "from-slate-900/60 to-blue-800/40" },
              { label: "Income", value: summary.income, icon: TrendingUp, cls: "from-emerald-900/60 to-emerald-500/30" },
              { label: "Expense", value: summary.expense, icon: TrendingDown, cls: "from-rose-900/60 to-rose-500/30" },
            ].map((card) => (
              <article
                key={card.label}
                className={`group rounded-3xl border border-white/15 bg-gradient-to-br ${card.cls} p-4 shadow-xl backdrop-blur-xl transition duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl`}
              >
                <p className="flex items-center gap-2 text-sm opacity-90">
                  <span className="rounded-lg bg-white/10 p-2 transition group-hover:scale-105">
                    <card.icon size={16} />
                  </span>
                  {card.label}
                </p>
                <p className="mt-3 text-3xl font-bold tracking-tight">{formatCurrency(card.value)}</p>
              </article>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <article className={`rounded-3xl border p-4 shadow-2xl backdrop-blur-xl xl:col-span-2 ${glass}`}>
              <h3 className="mb-3 font-semibold">Monthly Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary.monthly}>
                    <defs>
                      <linearGradient id="incArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="expArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.32} />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                    <XAxis dataKey="month" stroke={theme === "dark" ? "#cbd5e1" : "#334155"} />
                    <YAxis stroke={theme === "dark" ? "#cbd5e1" : "#334155"} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="income" stroke="#22c55e" fill="url(#incArea)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="expense" stroke="#f43f5e" fill="url(#expArea)" strokeWidth={2.5} />
                    <Line type="monotone" dataKey="income" stroke="#16a34a" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="expense" stroke="#e11d48" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className={`rounded-3xl border p-4 shadow-2xl backdrop-blur-xl ${glass}`}>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Sparkles size={16} /> AI Finance Assistant
              </h3>
              <ExpenseAgent />
            </article>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <article className={`rounded-3xl border p-4 shadow-2xl backdrop-blur-xl ${glass}`}>
              <h3 className="mb-3 font-semibold">Budget</h3>
              <input
                type="number"
                min="0"
                value={monthlyBudget || ""}
                onChange={(e) => {
                  const v = Number(e.target.value || 0);
                  setMonthlyBudget(v);
                  localStorage.setItem("monthly_budget", String(v));
                }}
                placeholder="Set monthly budget"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2"
              />
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div
                  className={`h-2 rounded-full ${budgetUsed > 100 ? "bg-rose-400" : "bg-emerald-400"}`}
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-sm">{monthlyBudget ? `${budgetUsed.toFixed(0)}% used` : "No budget set"}</p>
            </article>

            <article className={`rounded-3xl border p-4 shadow-2xl backdrop-blur-xl ${glass}`}>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <UserCircle2 size={16} /> Profile
              </h3>
              <p className="text-sm">Name: {user.name}</p>
              <p className="text-sm">Email: {user.email}</p>
            </article>

            <article className={`rounded-3xl border p-4 shadow-2xl backdrop-blur-xl ${glass}`}>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Bell size={16} /> Notifications
              </h3>
              <ul className="space-y-2 text-sm">
                {notifications.length ? notifications.map((n) => <li key={n}>- {n}</li>) : <li>- All good</li>}
          </ul>
            </article>
        </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <article className={`rounded-3xl border p-4 shadow-2xl backdrop-blur-xl ${glass}`}>
              <h3 className="mb-3 font-semibold">Savings Goals</h3>
              <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <input
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  placeholder="Goal name"
                  className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm"
                />
                <input
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  placeholder="Target amount"
                  type="number"
                  className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm"
                />
                <button
                  onClick={addGoal}
                  className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-medium text-white"
                >
                  Add Goal
                </button>
              </div>
              <div className="space-y-2">
                {goals.length ? (
                  goals.map((g) => {
                    const pct = g.target > 0 ? (g.saved / g.target) * 100 : 0;
                    return (
                      <div key={g.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{g.name}</p>
                          <p className="text-xs opacity-80">
                            {formatCurrency(g.saved)} / {formatCurrency(g.target)}
                          </p>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-white/10">
                          <div
                            className="h-2 rounded-full bg-cyan-400"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => addToGoal(g.id)}
                            className="rounded-lg bg-cyan-500 px-2 py-1 text-xs text-white"
                          >
                            Add from savings
                          </button>
                          <button
                            onClick={() => removeGoal(g.id)}
                            className="rounded-lg bg-rose-500 px-2 py-1 text-xs text-white"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm opacity-80">No goals yet. Add your first savings goal.</p>
                )}
              </div>
            </article>

            <article className={`rounded-3xl border p-4 shadow-2xl backdrop-blur-xl ${glass}`}>
              <h3 className="mb-3 font-semibold">3-Month Cashflow Forecast</h3>
              <div className="space-y-2">
                {forecastRows.map((row) => (
                  <div
                    key={row.month}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <p className="text-sm">{row.month}</p>
                    <p
                      className={`font-semibold ${
                        row.projected >= 0 ? "text-emerald-300" : "text-rose-300"
                      }`}
                    >
                      {formatCurrency(row.projected)}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs opacity-70">
                Forecast uses your average monthly net cashflow (income - expense).
              </p>
            </article>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <article className={`rounded-3xl border p-4 shadow-2xl backdrop-blur-xl ${glass}`}>
              <div className="mb-3 flex flex-wrap gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white [color-scheme:dark]"
                >
                  <option value="" className="bg-slate-900 text-slate-100">All types</option>
                  <option value="income" className="bg-slate-900 text-slate-100">Income</option>
                  <option value="expense" className="bg-slate-900 text-slate-100">Expense</option>
                </select>
                <input
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  placeholder="Filter by category"
                  className="rounded-xl border border-white/20 bg-white/10 px-3 py-2"
                />
                <input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2" />
                <input value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2" />
                <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-3 py-2 text-white">
                  <Download size={14} /> CSV
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="h-56 rounded-2xl border border-white/10 bg-white/5 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={summary.breakdown} dataKey="value" nameKey="name" outerRadius={80} label>
                        <Cell fill="#22c55e" />
                        <Cell fill="#f43f5e" />
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-56 rounded-2xl border border-white/10 bg-white/5 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary.categories}>
                      <defs>
                        <linearGradient id="barPremium" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#60a5fa" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="total" fill="url(#barPremium)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {loading ? (
                  <p>Loading transactions...</p>
                ) : transactions.length ? (
                  transactions.slice(0, 8).map((tx) => (
                    <div
                      key={tx._id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-3 py-2 transition hover:-translate-y-0.5"
                    >
                      <div>
                        <span className={`rounded-full px-2 py-1 text-xs capitalize ${CATEGORY_COLORS[tx.category] || CATEGORY_COLORS.other}`}>
                          {tx.category}
                        </span>
                        <p className="mt-1 text-xs opacity-80">{new Date(tx.date).toLocaleDateString()}</p>
                        {!!tx.notes && <p className="mt-1 text-xs opacity-70">{tx.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className={tx.type === "income" ? "text-emerald-300" : "text-rose-300"}>
                          {tx.type === "income" ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </p>
                        <button onClick={() => beginEdit(tx)} className="rounded-lg bg-amber-500/80 p-2">
                          <PencilLine size={12} />
                        </button>
                        <button onClick={() => deleteTransaction(tx._id).then(loadData)} className="rounded-lg bg-rose-500/80 p-2">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/20 p-6 text-center">
                    <CircleDollarSign className="mx-auto mb-2 opacity-60" />
                    <p>No transactions yet. Add one to see analytics.</p>
                  </div>
                )}
              </div>
            </article>
          </div>

          {isTxModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
              <div className={`w-full max-w-md rounded-3xl border p-5 shadow-2xl ${glass}`}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">{editingId ? "Edit Transaction" : "Add Transaction"}</h3>
                  <button
                    onClick={() => {
                      setIsTxModalOpen(false);
                      setEditingId("");
                      setForm(initialForm);
                    }}
                    className="rounded-lg bg-white/10 px-2 py-1 text-sm"
                  >
                    x
                  </button>
                </div>
                <form className="space-y-2" onSubmit={handleSubmit}>
                  <div>
                    <p className="mb-1 text-xs opacity-80">Type</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, type: "expense" }))}
                        className={`rounded-xl border px-3 py-2 ${form.type === "expense" ? "border-rose-300/50 bg-rose-500/20" : "border-white/20 bg-white/10"}`}
                      >
                        Expense
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, type: "income" }))}
                        className={`rounded-xl border px-3 py-2 ${form.type === "income" ? "border-emerald-300/50 bg-emerald-500/20" : "border-white/20 bg-white/10"}`}
                      >
                        Income
                      </button>
                    </div>
                  </div>
                  <input
                    name="amount"
                    value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    type="number"
                    min="1"
                    placeholder="Amount"
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2"
                    required
                  />
                  <select
                    name="category"
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white [color-scheme:dark]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <input
                    name="date"
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    type="date"
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2"
                    required
                  />
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Notes"
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2"
                    rows={3}
                  />
                  <button
                    disabled={submitting}
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-3 py-2 font-medium text-white"
                  >
                    {submitting ? "Saving..." : editingId ? "Update Transaction" : "Add Transaction"}
                  </button>
                </form>
              </div>
        </div>
          )}
      </section>
      </div>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("finance_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  const handleLogout = () => {
    localStorage.removeItem("finance_user");
    localStorage.removeItem("finance_token");
    setUser(null);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  if (!user) return <LoginView onLogin={setUser} theme={theme} />;
  return <Dashboard user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />;
}
