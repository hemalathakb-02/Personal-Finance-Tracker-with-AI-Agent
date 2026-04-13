const crypto = require("crypto");
const User = require("../models/User");

const demoCredentials = {
  name: "Demo User",
  email: "demo@finance.com",
  password: "demo123",
};

const inMemoryUsers = [];

const isMongoReady = () => !!process.env.MONGO_CONNECTED;
const hashPassword = (password) => crypto.createHash("sha256").update(password).digest("hex");

const normalizeUser = (user) => ({
  id: user._id ? String(user._id) : user.id,
  name: user.name,
  email: user.email,
});

const findByEmail = async (email) => {
  const normalizedEmail = String(email).toLowerCase().trim();
  if (isMongoReady()) {
    return User.findOne({ email: normalizedEmail });
  }
  return inMemoryUsers.find((user) => user.email === normalizedEmail) || null;
};

const createUser = async ({ name, email, password }) => {
  const existing = await findByEmail(email);
  if (existing) {
    return { error: "Email already exists." };
  }

  const passwordHash = hashPassword(password);
  const normalizedEmail = String(email).toLowerCase().trim();

  if (isMongoReady()) {
    const user = await User.create({ name, email: normalizedEmail, passwordHash });
    return { user: normalizeUser(user) };
  }

  const newUser = {
    id: `u-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    email: normalizedEmail,
    passwordHash,
  };
  inMemoryUsers.push(newUser);
  return { user: normalizeUser(newUser) };
};

const authenticateUser = async ({ email, password }) => {
  const user = await findByEmail(email);
  if (!user) return null;
  return user.passwordHash === hashPassword(password) ? normalizeUser(user) : null;
};

const ensureDemoUser = async () => {
  const existing = await findByEmail(demoCredentials.email);
  if (existing) return normalizeUser(existing);
  const created = await createUser(demoCredentials);
  return created.user;
};

module.exports = {
  createUser,
  authenticateUser,
  ensureDemoUser,
};
