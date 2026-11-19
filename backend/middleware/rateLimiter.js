import { rateLimit } from "express-rate-limit";

const buildLimiter = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

export const authLimiter = buildLimiter(
  15 * 60 * 1000,
  20,
  "Too many attempts, please try again in 15 minutes"
);

export const uploadLimiter = buildLimiter(
  60 * 60 * 1000,
  20,
  "Upload limit reached, please try again later"
);