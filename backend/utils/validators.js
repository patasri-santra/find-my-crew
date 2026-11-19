import { httpError } from "./httpError.js";

export const lengthBetween = (value, min, max) =>
  typeof value === "string" && value.trim().length >= min && value.trim().length <= max;

// Only accept images uploaded to OUR Cloudinary account via /api/uploads/image
export const assertCloudinaryUrl = (value, label) => {
  if (typeof value !== "string") throw httpError(400, `${label} must be a valid URL`);

  let url;
  try {
    url = new URL(value);
  } catch {
    throw httpError(400, `${label} must be a valid URL`);
  }

  if (
    url.protocol !== "https:" ||
    url.hostname !== "res.cloudinary.com" ||
    !url.pathname.startsWith(`/${process.env.CLOUDINARY_CLOUD_NAME}/`)
  ) {
    throw httpError(400, `${label} must be uploaded through the app`);
  }
};