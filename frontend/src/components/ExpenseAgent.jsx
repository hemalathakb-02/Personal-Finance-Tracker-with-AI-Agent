import { useMemo, useState } from "react";
import {
  createAgentExpense,
  deleteAgentExpense,
  getAgentExpenseAnalytics,
  getAgentExpensesByMobile,
  updateAgentExpenseDate,
} from "../api";

const FAQS = [
  { key: "card type", answer: "Accepted card types are Debit Card and Credit Card only." },
  { key: "category", answer: "Allowed categories are Transport, Shopping, and Food." },
  { key: "date format", answer: "Date format must be exactly DD-MM-YYYY." },
  { key: "contact", answer: "Contact number format: country code + exactly 10 digits. Example: +911234567890" },
  { key: "email", answer: "Please provide a valid email like name@example.com." },
];

const initialDraft = {
  fullName: "",
  cardType: "",
  category: "",
  amount: "",
  description: "",
  date: "",
  contactNumber: "",
  email: "",
};

const DATE_RE = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
const PHONE_RE = /^\+\d{1,3}\d{10}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const missingFields = (d) => {
  const miss = [];
  if (!/^\S+\s+\S+/.test(d.fullName)) miss.push("fullName");
  if (!["Debit Card", "Credit Card"].includes(d.cardType)) miss.push("cardType");
  if (!["Transport", "Shopping", "Food"].includes(d.category)) miss.push("category");
  if (d.amount === "" || Number.isNaN(Number(d.amount))) miss.push("amount");
  if (!d.description.trim()) miss.push("description");
  if (!DATE_RE.test(d.date)) miss.push("date");
  if (!PHONE_RE.test(d.contactNumber)) miss.push("contactNumber");
  if (!EMAIL_RE.test(d.email)) miss.push("email");
  return miss;
};

const parseFields = (text) => {
  const lower = text.toLowerCase();
  const patch = {};
  const name = text.match(/\b([A-Za-z]{2,}\s+[A-Za-z]{2,}(?:\s+[A-Za-z]{2,})?)\b/);
  if (name) patch.fullName = name[1];
  if (lower.includes("debit")) patch.cardType = "Debit Card";
  if (lower.includes("credit")) patch.cardType = "Credit Card";
  if (lower.includes("transport")) patch.category = "Transport";
  if (lower.includes("shopping")) patch.category = "Shopping";
  if (lower.includes("food")) patch.category = "Food";
  const amount = text.match(/\b(?:amount\s*(?:is|=)?\s*)?(\d+(?:\.\d{1,2})?)\b/i);
  if (amount) patch.amount = amount[1];
  const date = text.match(/\b(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}\b/);
  if (date) patch.date = date[0];
  const phone = text.match(/\+\d{1,3}\d{10}\b/);
  if (phone) patch.contactNumber = phone[0];
  const email = text.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
  if (email) patch.email = email[0];
  const description = text.match(/(?:description|desc)\s*(?:is|:)?\s*(.+)$/i);
  if (description) patch.description = description[1].trim();
  const correction = text.match(/(?:change|update|set)\s+(name|card type|category|amount|description|date|contact number|email)\s+(?:to|as)\s+(.+)/i);
  if (correction) {
    const fieldMap = {
      name: "fullName",
      "card type": "cardType",
      category: "category",
      amount: "amount",
      description: "description",
      date: "date",
      "contact number": "contactNumber",
      email: "email",
    };
    const field = fieldMap[correction[1].toLowerCase()];
    if (field) patch[field] = correction[2].trim();
  }
  return patch;
};

export default function ExpenseAgent() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Expense Agent ready. Choose: Create Expense, View Expenses, Modify/Delete Expense." },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("menu");
  const [draft, setDraft] = useState(initialDraft);
  const [mobileLookup, setMobileLookup] = useState("");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [records, setRecords] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const push = (role, text) => setMessages((prev) => [...prev, { role, text }]);

  const menuHelp = useMemo(
    () => "Menu options: 1) Create Expense  2) View Expenses  3) Modify/Delete Expense",
    []
  );

  const handleFaq = (text) => {
    const lower = text.toLowerCase();
    const match = FAQS.find((f) => lower.includes(f.key));
    if (!match) return false;
    push("assistant", match.answer);
    return true;
  };

  const createFlow = async (text) => {
    const merged = { ...draft, ...parseFields(text) };
    setDraft(merged);
    const missing = missingFields(merged);

    if (missing.length) {
      push(
        "assistant",
        `Captured fields updated. Missing: ${missing.join(", ")}. You can provide multiple fields in one message.`
      );
      return;
    }

    push(
      "assistant",
      `Please confirm before save:\n- Full Name: ${merged.fullName}\n- Card Type: ${merged.cardType}\n- Category: ${merged.category}\n- Amount: ${merged.amount}\n- Description: ${merged.description}\n- Date: ${merged.date}\n- Contact: ${merged.contactNumber}\n- Email: ${merged.email}\nReply "confirm" to save, or amend any field (example: change amount to 450).`
    );
    setMode("confirmCreate");
  };

  const onSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    push("user", text);

    if (handleFaq(text)) return;

    if (mode === "menu") {
      if (/^1|create/i.test(text)) {
        setMode("create");
        setDraft(initialDraft);
        push("assistant", "Create Expense started. Provide details. You can send multiple fields in one message.");
        return;
      }
      if (/^2|view/i.test(text)) {
        setMode("view");
        push("assistant", "Enter mobile number to view records. Format: +<countrycode><10digits>");
        return;
      }
      if (/^3|modify|delete/i.test(text)) {
        setMode("modifyLookup");
        push("assistant", "Enter mobile number to find records for modify/delete.");
        return;
      }
      if (/analytics/i.test(text)) {
        try {
          const data = await getAgentExpenseAnalytics();
          setAnalytics(data);
          push("assistant", "Analytics loaded below.");
        } catch {
          push("assistant", "Unable to load analytics now.");
        }
        return;
      }
      push("assistant", menuHelp);
      return;
    }

    if (mode === "create") return createFlow(text);

    if (mode === "confirmCreate") {
      if (/confirm|save/i.test(text)) {
        try {
          await createAgentExpense({ ...draft, amount: Number(draft.amount) });
          push("assistant", "Expense saved successfully.");
        } catch {
          push("assistant", "Failed to save expense due to API error. Please try again.");
        }
        setMode("menu");
        setDraft(initialDraft);
        return;
      }
      const amended = { ...draft, ...parseFields(text) };
      setDraft(amended);
      push("assistant", "Amendment captured. Reply confirm to save or keep amending.");
      return;
    }

    if (mode === "view") {
      if (!PHONE_RE.test(text)) {
        push("assistant", "Invalid number. Please re-enter in +<countrycode><10digits> format.");
        return;
      }
      setMobileLookup(text);
      try {
        const data = await getAgentExpensesByMobile(text);
        setRecords(data);
        push("assistant", `Found ${data.length} records. Showing below.`);
      } catch {
        push("assistant", "No records found for this mobile. You can re-enter another number.");
      }
      return;
    }

    if (mode === "modifyLookup") {
      if (!PHONE_RE.test(text)) {
        push("assistant", "Invalid number format. Please re-enter.");
        return;
      }
      setMobileLookup(text);
      try {
        const data = await getAgentExpensesByMobile(text);
        setRecords(data);
        setMode("modifySelect");
        push("assistant", `Found ${data.length} records. Reply with record number (1,2,3...)`);
      } catch {
        push("assistant", "No records found. Try another number.");
      }
      return;
    }

    if (mode === "modifySelect") {
      const idx = Number(text) - 1;
      if (Number.isNaN(idx) || idx < 0 || idx >= records.length) {
        push("assistant", "Invalid selection. Reply with a valid record number.");
        return;
      }
      setSelectedExpense(records[idx]);
      setMode("modifyAction");
      push("assistant", 'Selected. Reply "change date DD-MM-YYYY" or "delete".');
      return;
    }

    if (mode === "modifyAction") {
      if (/^delete/i.test(text)) {
        setMode("confirmDelete");
        push("assistant", 'Confirm delete? Reply "yes" to proceed.');
        return;
      }
      const date = text.match(/\b(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}\b/);
      if (/change date/i.test(text) && date) {
        try {
          await updateAgentExpenseDate(selectedExpense._id, date[0]);
          push("assistant", "Date updated successfully.");
        } catch {
          push("assistant", "Failed to update date.");
        }
        setMode("menu");
        return;
      }
      push("assistant", 'Unknown action. Use "change date DD-MM-YYYY" or "delete".');
      return;
    }

    if (mode === "confirmDelete") {
      if (/^yes$/i.test(text)) {
        try {
          await deleteAgentExpense(selectedExpense._id);
          push("assistant", "Expense deleted successfully.");
        } catch {
          push("assistant", "Delete failed.");
        }
        setMode("menu");
      } else {
        push("assistant", "Delete cancelled.");
        setMode("menu");
      }
      return;
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
      <div className="mb-2 flex flex-wrap gap-2">
        <button onClick={() => setMode("menu")} className="rounded bg-cyan-600 px-2 py-1 text-xs text-white">
          Menu
        </button>
        <button onClick={() => { setMode("create"); push("assistant", "Create flow opened."); }} className="rounded bg-blue-600 px-2 py-1 text-xs text-white">
          Create Expense
        </button>
        <button onClick={() => { setMode("view"); push("assistant", "Enter mobile to view expenses."); }} className="rounded bg-indigo-600 px-2 py-1 text-xs text-white">
          View Expenses
        </button>
        <button onClick={() => { setMode("modifyLookup"); push("assistant", "Enter mobile for modify/delete."); }} className="rounded bg-violet-600 px-2 py-1 text-xs text-white">
          Modify/Delete
        </button>
      </div>
      <div className="h-48 overflow-auto rounded border border-white/10 bg-black/20 p-2">
        {messages.map((m, i) => (
          <p key={i} className={`mb-1 ${m.role === "assistant" ? "text-cyan-200" : "text-slate-100"}`}>
            <strong>{m.role === "assistant" ? "Agent" : "You"}:</strong> {m.text}
          </p>
        ))}
      </div>
      <form onSubmit={onSend} className="mt-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="w-full rounded border border-white/20 bg-white/10 px-2 py-1"
        />
        <button className="rounded bg-emerald-600 px-3 py-1 text-white">Send</button>
      </form>

      {records.length > 0 && (
        <div className="mt-2 rounded border border-white/10 bg-black/20 p-2 text-xs">
          <p className="mb-1 font-semibold">Fetched expenses ({mobileLookup}):</p>
          {records.slice(0, 5).map((r, idx) => (
            <p key={r._id}>
              {idx + 1}. {r.fullName} | {r.category} | {r.amount} | {r.date}
            </p>
          ))}
        </div>
      )}

      {analytics && (
        <div className="mt-2 rounded border border-white/10 bg-black/20 p-2 text-xs">
          <p className="font-semibold">Analytics</p>
          <p>Total this month: {analytics.totalThisMonth}</p>
          <p>Last 5 transactions: {analytics.last5.length}</p>
          {analytics.byCategory.map((c) => (
            <p key={c.category}>
              {c.category}: {c.total}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
