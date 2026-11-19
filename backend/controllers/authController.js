import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import formatUser from "../utils/formatUser.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendAuthResponse = (res, statusCode, user) => {
  res.status(statusCode).json({
    success: true,
    token: generateToken(user._id),
    user: formatUser(user),
  });
};

// POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if ([name, email, password, confirmPassword].some((v) => typeof v !== "string" || !v.trim())) {
    res.status(400);
    throw new Error("All fields are required");
  }
  if (name.trim().length < 2 || name.trim().length > 50) {
    res.status(400);
    throw new Error("Name must be between 2 and 50 characters");
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    res.status(400);
    throw new Error("Please enter a valid email address");
  }
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    res.status(400);
    throw new Error("Password must be at least 8 characters with a letter and a number");
  }
  if (password !== confirmPassword) {
    res.status(400);
    throw new Error("Passwords do not match");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (await User.findOne({ email: normalizedEmail })) {
    res.status(409);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({ name: name.trim(), email: normalizedEmail, password });
  sendAuthResponse(res, 201, user);
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  sendAuthResponse(res, 200, user);
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: formatUser(req.user) });
};