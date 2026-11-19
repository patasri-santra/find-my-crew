import mongoose from "mongoose";

export const REQUEST_STATUSES = ["pending", "accepted", "rejected"];

const joinRequestSchema = new mongoose.Schema(
  {
    activity: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: REQUEST_STATUSES, default: "pending" },
  },
  { timestamps: true }
);

// One request per person per activity, enforced by the database itself
joinRequestSchema.index({ activity: 1, requester: 1 }, { unique: true });
joinRequestSchema.index({ host: 1, status: 1, createdAt: -1 });
joinRequestSchema.index({ requester: 1, createdAt: -1 });

export default mongoose.model("JoinRequest", joinRequestSchema);