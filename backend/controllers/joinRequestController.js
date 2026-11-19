import mongoose from "mongoose";
import Activity from "../models/Activity.js";
import JoinRequest, { REQUEST_STATUSES } from "../models/JoinRequest.js";
import { httpError } from "../utils/httpError.js";
import { HOST_FIELDS, PARTICIPANT_FIELDS } from "../utils/populateFields.js";

const REQUESTER_FIELDS = "name profileImage bio interests";

// Works out the right error when a conditional request update matched nothing
const explainRequestFailure = async (requestId, userId) => {
  const request = await JoinRequest.findById(requestId);
  if (!request) return httpError(404, "Join request not found");
  if (!request.host.equals(userId)) {
    return httpError(403, "Only the host can respond to this request");
  }
  return httpError(409, `This request was already ${request.status}`);
};

// Works out why the activity update matched nothing
const explainAcceptFailure = async (activityId, requesterId, session) => {
  const activity = await Activity.findById(activityId).session(session);
  if (!activity) return httpError(404, "Activity no longer exists");
  if (activity.status !== "active") return httpError(409, "This activity was cancelled");
  if (activity.date <= new Date()) return httpError(409, "This activity has already started");
  if (activity.participants.some((id) => id.equals(requesterId))) {
    return httpError(409, "This person is already a participant");
  }
  return httpError(409, "Activity is full");
};

// POST /api/join-requests/:activityId
export const createJoinRequest = async (req, res) => {
  const activity = await Activity.findById(req.params.activityId);
  if (!activity) throw httpError(404, "Activity not found");
  if (activity.status !== "active") throw httpError(400, "This activity is not active");
  if (activity.date <= new Date()) throw httpError(400, "This activity has already started");
  if (activity.host.equals(req.user._id)) {
    throw httpError(400, "You can't request to join your own activity");
  }
  if (activity.participants.some((id) => id.equals(req.user._id))) {
    throw httpError(409, "You have already joined this activity");
  }
  if (activity.participants.length >= activity.maxParticipants) {
    throw httpError(409, "This activity is full");
  }

  const existing = await JoinRequest.findOne({ activity: activity._id, requester: req.user._id });
  if (existing) {
    const messages = {
      pending: "You already have a pending request for this activity",
      accepted: "Your request was already accepted",
      rejected: "The host declined your earlier request for this activity",
    };
    throw httpError(409, messages[existing.status]);
  }

  let request;
  try {
    request = await JoinRequest.create({
      activity: activity._id,
      requester: req.user._id,
      host: activity.host,
    });
  } catch (error) {
    // two simultaneous clicks: the unique index is the safety net
    if (error.code === 11000) {
      throw httpError(409, "You already have a request for this activity");
    }
    throw error;
  }

  res.status(201).json({ success: true, request });
};

// GET /api/join-requests/received?status=pending
export const getReceivedRequests = async (req, res) => {
  const filter = { host: req.user._id };
  if (req.query.status !== undefined) {
    if (!REQUEST_STATUSES.includes(req.query.status)) throw httpError(400, "Invalid status");
    filter.status = req.query.status;
  }

  const requests = await JoinRequest.find(filter)
    .sort({ createdAt: -1 })
    .populate("requester", REQUESTER_FIELDS)
    .populate("activity", "title date startTime status coverImage maxParticipants participants");

  res.status(200).json({ success: true, requests });
};

// GET /api/join-requests/sent
export const getSentRequests = async (req, res) => {
  const requests = await JoinRequest.find({ requester: req.user._id })
    .sort({ createdAt: -1 })
    .populate("activity", "title date startTime status coverImage location.address")
    .populate("host", HOST_FIELDS);

  res.status(200).json({ success: true, requests });
};

// PATCH /api/join-requests/:requestId/accept
export const acceptRequest = async (req, res) => {
  const { request, activity } = await mongoose.connection.transaction(async (session) => {
    // 1. Claim the request: only succeeds if it is still pending and this user is the host
    const joinRequest = await JoinRequest.findOneAndUpdate(
      { _id: req.params.requestId, host: req.user._id, status: "pending" },
      { status: "accepted" },
      { new: true, session }
    );
    if (!joinRequest) throw await explainRequestFailure(req.params.requestId, req.user._id);

    // 2. Add the participant only if there is still room. One atomic operation.
    const updatedActivity = await Activity.findOneAndUpdate(
      {
        _id: joinRequest.activity,
        host: req.user._id,
        status: "active",
        date: { $gt: new Date() },
        participants: { $ne: joinRequest.requester },
        $expr: { $lt: [{ $size: "$participants" }, "$maxParticipants"] },
      },
      { $addToSet: { participants: joinRequest.requester } },
      { new: true, session }
    );
    // Throwing here aborts the transaction, which un-accepts the request automatically
    if (!updatedActivity) {
      throw await explainAcceptFailure(joinRequest.activity, joinRequest.requester, session);
    }

    return { request: joinRequest, activity: updatedActivity };
  });

  await activity.populate([
    { path: "host", select: HOST_FIELDS },
    { path: "participants", select: PARTICIPANT_FIELDS },
  ]);

  res.status(200).json({ success: true, request, activity });
};

// PATCH /api/join-requests/:requestId/reject
export const rejectRequest = async (req, res) => {
  const request = await JoinRequest.findOneAndUpdate(
    { _id: req.params.requestId, host: req.user._id, status: "pending" },
    { status: "rejected" },
    { new: true }
  );
  if (!request) throw await explainRequestFailure(req.params.requestId, req.user._id);

  res.status(200).json({ success: true, request });
};