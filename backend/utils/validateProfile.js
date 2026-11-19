import { httpError } from "./httpError.js";
import { lengthBetween } from "./validators.js";

const normalizeInterests = (value) => {
  if (!Array.isArray(value) || value.length > 10) {
    throw httpError(400, "Interests must be a list of up to 10 items");
  }

  const seen = new Set();
  const cleaned = [];
  for (const item of value) {
    if (!lengthBetween(item, 2, 30)) throw httpError(400, "Each interest must be 2-30 characters");
    const trimmed = item.trim();
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      cleaned.push(trimmed);
    }
  }
  return cleaned;
};

// Whitelist: only these four fields can ever be changed through the profile endpoint
export const validateProfileInput = (body) => {
  const data = {};

  if (body.name !== undefined) {
    if (!lengthBetween(body.name, 2, 50)) throw httpError(400, "Name must be 2-50 characters");
    data.name = body.name.trim();
  }
  if (body.bio !== undefined) {
    if (typeof body.bio !== "string" || body.bio.trim().length > 300) {
      throw httpError(400, "Bio must be 300 characters or fewer");
    }
    data.bio = body.bio.trim();
  }
  if (body.locationLabel !== undefined) {
    if (typeof body.locationLabel !== "string" || body.locationLabel.trim().length > 80) {
      throw httpError(400, "Location must be 80 characters or fewer");
    }
    data.locationLabel = body.locationLabel.trim();
  }
  if (body.interests !== undefined) {
    data.interests = normalizeInterests(body.interests);
  }

  if (Object.keys(data).length === 0) throw httpError(400, "No valid fields to update");
  return data;
};