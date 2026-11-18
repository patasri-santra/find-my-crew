import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  let decoded;
  try {
    decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error("Not authorized, invalid or expired token");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    res.status(401);
    throw new Error("Not authorized, user no longer exists");
  }

  req.user = user;
  next();
};