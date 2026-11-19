import { CATEGORIES } from "../models/Activity.js";
import { httpError } from "./httpError.js";
import { lengthBetween, assertCloudinaryUrl } from "./validators.js";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const isString = (value) => typeof value === "string";

export const assertEndAfterStart = (startTime, endTime) => {
  if (endTime && endTime <= startTime) {
    throw httpError(400, "End time must be after start time");
  }
};

// partial = true is used for updates: only validate the fields that were sent
export const validateActivityInput = (body, { partial = false } = {}) => {
  const data = {};

  const present = (key) => {
    if (body[key] === undefined) {
      if (!partial) throw httpError(400, `${key} is required`);
      return false;
    }
    return true;
  };

  if (present("title")) {
    if (!lengthBetween(body.title, 3, 100)) throw httpError(400, "Title must be 3-100 characters");
    data.title = body.title.trim();
  }

  if (present("description")) {
    if (!lengthBetween(body.description, 10, 2000)) {
      throw httpError(400, "Description must be 10-2000 characters");
    }
    data.description = body.description.trim();
  }

  if (present("category")) {
    if (!CATEGORIES.includes(body.category)) {
      throw httpError(400, `Category must be one of: ${CATEGORIES.join(", ")}`);
    }
    data.category = body.category;
  }

  if (present("date")) {
    const date = isString(body.date) ? new Date(body.date) : new Date(NaN);
    if (Number.isNaN(date.getTime())) throw httpError(400, "Date is invalid");
    if (date <= new Date()) throw httpError(400, "Activity date must be in the future");
    data.date = date;
  }

  if (present("startTime")) {
    if (!isString(body.startTime) || !TIME_REGEX.test(body.startTime)) {
      throw httpError(400, "Start time must be in HH:mm format");
    }
    data.startTime = body.startTime;
  }

  if (body.endTime !== undefined) {
    if (body.endTime !== "" && (!isString(body.endTime) || !TIME_REGEX.test(body.endTime))) {
      throw httpError(400, "End time must be in HH:mm format");
    }
    data.endTime = body.endTime;
  }

  if (present("maxParticipants")) {
    const max = body.maxParticipants;
    if (!Number.isInteger(max) || max < 2 || max > 100) {
      throw httpError(400, "Max participants must be a whole number between 2 and 100");
    }
    data.maxParticipants = max;
  }

  if (present("location")) {
    const { address, latitude, longitude } = body.location || {};
    if (!lengthBetween(address, 3, 200)) throw httpError(400, "Location address must be 3-200 characters");
    if (typeof latitude !== "number" || latitude < -90 || latitude > 90) {
      throw httpError(400, "Latitude must be a number between -90 and 90");
    }
    if (typeof longitude !== "number" || longitude < -180 || longitude > 180) {
      throw httpError(400, "Longitude must be a number between -180 and 180");
    }
    data.location = {
      address: address.trim(),
      coordinates: { type: "Point", coordinates: [longitude, latitude] },
    };
  }

  if (body.coverImage !== undefined && body.coverImage !== "") {
    assertCloudinaryUrl(body.coverImage, "Cover image");
    data.coverImage = body.coverImage;
  }

  return data;
};