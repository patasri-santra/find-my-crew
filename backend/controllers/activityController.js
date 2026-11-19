import mongoose from "mongoose";
import Activity, { CATEGORIES } from "../models/Activity.js";
import JoinRequest from "../models/JoinRequest.js";
import { httpError } from "../utils/httpError.js";
import { validateActivityInput, assertEndAfterStart } from "../utils/validateActivity.js";
import { HOST_FIELDS, PARTICIPANT_FIELDS } from "../utils/populateFields.js";

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const toNumber = (value) =>
  typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;

const parseGeoQuery = ({ lat, lng, radius }) => {
  if (lat === undefined && lng === undefined) return null;
  const latitude = toNumber(lat);
  const longitude = toNumber(lng);
  const radiusKm = radius === undefined ? 10 : toNumber(radius);

  if (!(latitude >= -90 && latitude <= 90) || !(longitude >= -180 && longitude <= 180)) {
    throw httpError(400, "Valid lat and lng are required");
  }
  if (!(radiusKm > 0 && radiusKm <= 100)) {
    throw httpError(400, "Radius must be between 0 and 100 (km)");
  }
  return { latitude, longitude, radiusKm };
};

// POST /api/activities
export const createActivity = async (req, res) => {
  const data = validateActivityInput(req.body);
  assertEndAfterStart(data.startTime, data.endTime);

  const activity = await Activity.create({
    ...data,
    host: req.user._id,
    participants: [req.user._id], // creator is automatically a participant
  });
  await activity.populate("host", HOST_FIELDS);

  res.status(201).json({ success: true, activity });
};

// GET /api/activities?q=&category=&from=&to=&sort=&lat=&lng=&radius=&page=&limit=
export const getActivities = async (req, res) => {
  const { q, category, from, to, sort = "upcoming" } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);

  const now = new Date();
  const filter = { status: "active", date: { $gte: now } };

  if (typeof q === "string" && q.trim()) {
    const regex = new RegExp(escapeRegex(q.trim().slice(0, 100)), "i");
    filter.$or = [{ title: regex }, { description: regex }];
  }

  if (category !== undefined) {
    if (!CATEGORIES.includes(category)) throw httpError(400, "Invalid category");
    filter.category = category;
  }

  if (from !== undefined) {
    const fromDate = new Date(from);
    if (Number.isNaN(fromDate.getTime())) throw httpError(400, "Invalid 'from' date");
    if (fromDate > now) filter.date.$gte = fromDate;
  }
  if (to !== undefined) {
    const toDate = new Date(to);
    if (Number.isNaN(toDate.getTime())) throw httpError(400, "Invalid 'to' date");
    filter.date.$lte = toDate;
  }

  const geo = parseGeoQuery(req.query);
  if (geo) {
    filter["location.coordinates"] = {
      $geoWithin: { $centerSphere: [[geo.longitude, geo.latitude], geo.radiusKm / 6378.1] },
    };
  }

  const sortOption = sort === "newest" ? { createdAt: -1 } : { date: 1 };

  const [activities, total] = await Promise.all([
    Activity.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("host", HOST_FIELDS),
    Activity.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    activities,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
};

// GET /api/activities/nearby?lat=&lng=&radius=   (closest first)
export const getNearbyActivities = async (req, res) => {
  const geo = parseGeoQuery(req.query);
  if (!geo) throw httpError(400, "lat and lng are required");

  const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);

  const activities = await Activity.find({
    status: "active",
    date: { $gte: new Date() },
    "location.coordinates": {
      $near: {
        $geometry: { type: "Point", coordinates: [geo.longitude, geo.latitude] },
        $maxDistance: geo.radiusKm * 1000,
      },
    },
  })
    .limit(limit)
    .populate("host", HOST_FIELDS);

  res.status(200).json({ success: true, activities });
};

// GET /api/activities/:id
export const getActivityById = async (req, res) => {
  const activity = await Activity.findById(req.params.id)
    .populate("host", HOST_FIELDS)
    .populate("participants", PARTICIPANT_FIELDS);

  if (!activity) throw httpError(404, "Activity not found");
  res.status(200).json({ success: true, activity });
};

// PUT /api/activities/:id  (host only; also used to cancel)
export const updateActivity = async (req, res) => {
  const activity = await Activity.findById(req.params.id);
  if (!activity) throw httpError(404, "Activity not found");
  if (!activity.host.equals(req.user._id)) {
    throw httpError(403, "Only the host can edit this activity");
  }
  if (activity.status !== "active") throw httpError(400, "Only active activities can be edited");
  if (activity.date <= new Date()) throw httpError(400, "Past activities can't be edited");

  const data = validateActivityInput(req.body, { partial: true });

  if (req.body.status !== undefined) {
    if (req.body.status !== "cancelled") {
      throw httpError(400, "Status can only be changed to 'cancelled'");
    }
    data.status = "cancelled";
  }

  if (data.maxParticipants !== undefined && data.maxParticipants < activity.participants.length) {
    throw httpError(
      400,
      `Max participants can't be lower than current participants (${activity.participants.length})`
    );
  }

  assertEndAfterStart(data.startTime ?? activity.startTime, data.endTime ?? activity.endTime);

  activity.set(data);
  await activity.save();
  await activity.populate("host", HOST_FIELDS);

  res.status(200).json({ success: true, activity });
};

// DELETE /api/activities/:id  (host only)
export const deleteActivity = async (req, res) => {
  const activity = await Activity.findById(req.params.id);
  if (!activity) throw httpError(404, "Activity not found");
  if (!activity.host.equals(req.user._id)) {
    throw httpError(403, "Only the host can delete this activity");
  }

  await mongoose.connection.transaction(async (session) => {
    await JoinRequest.deleteMany({ activity: activity._id }, { session });
    await activity.deleteOne({ session });
  });
  res.status(200).json({ success: true, message: "Activity deleted" });
};

// DELETE /api/activities/:id/leave
export const leaveActivity = async (req, res) => {
  await mongoose.connection.transaction(async (session) => {
    const activity = await Activity.findOneAndUpdate(
      {
        _id: req.params.id,
        host: { $ne: req.user._id },
        participants: req.user._id,
        status: "active",
        date: { $gt: new Date() },
      },
      { $pull: { participants: req.user._id } },
      { session }
    );
    if (!activity) {
      throw httpError(400, "You can only leave upcoming activities you've joined (hosts should cancel instead)");
    }
    // remove the accepted request so the user can ask to join again later
    await JoinRequest.deleteOne({ activity: activity._id, requester: req.user._id }, { session });
  });

  res.status(200).json({ success: true, message: "You left the activity" });
};

// GET /api/my-activities/created
export const getMyCreatedActivities = async (req, res) => {
  const activities = await Activity.find({ host: req.user._id })
    .sort({ date: -1 })
    .populate("participants", PARTICIPANT_FIELDS);

  res.status(200).json({ success: true, activities });
};

// GET /api/my-activities/joined
export const getMyJoinedActivities = async (req, res) => {
  const activities = await Activity.find({
    participants: req.user._id,
    host: { $ne: req.user._id },
  })
    .sort({ date: -1 })
    .populate("host", HOST_FIELDS);

  res.status(200).json({ success: true, activities });
};