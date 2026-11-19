import mongoose from "mongoose";

export const CATEGORIES = [
  "Sports",
  "Food and Cafes",
  "Travel and Exploration",
  "Study Groups",
  "Technology and Coding",
  "Photography",
  "Fitness",
  "Entertainment",
  "Other",
];

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    category: { type: String, required: true, enum: CATEGORIES },
    coverImage: { type: String, default: "" },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    maxParticipants: { type: Number, required: true, min: 2, max: 100 },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, default: "" },
    location: {
      address: { type: String, required: true, trim: true },
      coordinates: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], required: true },
      },
    },
    status: { type: String, enum: ["active", "cancelled", "completed"], default: "active" },
  },
  { timestamps: true, toJSON: { virtuals: true }, id: false }
);

activitySchema.virtual("availableSlots").get(function () {
  return this.maxParticipants - this.participants.length;
});

activitySchema.index({ "location.coordinates": "2dsphere" });
activitySchema.index({ status: 1, date: 1 });
activitySchema.index({ host: 1 });
activitySchema.index({ participants: 1 });

export default mongoose.model("Activity", activitySchema);