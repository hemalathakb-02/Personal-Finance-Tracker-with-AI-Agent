import axios from "axios";

const getToken = () => localStorage.getItem("finance_token");

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api`,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data;
};

export const signupUser = async (payload) => {
  const { data } = await api.post("/auth/signup", payload);
  return data;
};

export const getTransactions = async () => {
  const { data } = await api.get("/transactions");
  return data;
};

export const getFilteredTransactions = async (params) => {
  const { data } = await api.get("/transactions", { params });
  return data;
};

export const getSummary = async () => {
  const { data } = await api.get("/analytics/summary");
  return data;
};

export const getCategoriesAnalytics = async () => {
  const { data } = await api.get("/analytics/categories");
  return data;
};

export const getTrendsAnalytics = async () => {
  const { data } = await api.get("/analytics/trends");
  return data;
};

export const createTransaction = async (payload) => {
  const { data } = await api.post("/transactions", payload);
  return data;
};

export const deleteTransaction = async (id) => {
  const { data } = await api.delete(`/transactions/${id}`);
  return data;
};

export const updateTransaction = async (id, payload) => {
  const { data } = await api.put(`/transactions/${id}`, payload);
  return data;
};

export const getInsights = async () => {
  const { data } = await api.get("/insights");
  return data;
};

export const chatWithAi = async (message) => {
  const { data } = await api.post("/ai/chat", { message });
  return data;
};

export const createAgentExpense = async (payload) => {
  const { data } = await api.post("/agent-expenses", payload);
  return data;
};

export const getAgentExpensesByMobile = async (mobile) => {
  const { data } = await api.get("/agent-expenses", { params: { mobile } });
  return data;
};

export const updateAgentExpenseDate = async (id, date) => {
  const { data } = await api.put(`/agent-expenses/${id}/date`, { date });
  return data;
};

export const deleteAgentExpense = async (id) => {
  const { data } = await api.delete(`/agent-expenses/${id}`);
  return data;
};

export const getAgentExpenseAnalytics = async () => {
  const { data } = await api.get("/agent-expenses/analytics/view");
  return data;
};
