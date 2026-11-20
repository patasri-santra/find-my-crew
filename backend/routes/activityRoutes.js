import express from "express";
import {
  createActivity,
  getActivities,
  getNearbyActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  leaveActivity,
  getRecommendedActivities
} from "../controllers/activityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/nearby", getNearbyActivities);
router.get("/recommended", protect, getRecommendedActivities); // must stay above "/:id"
router.route("/").get(getActivities).post(protect, createActivity);
router
  .route("/:id")
  .get(getActivityById)
  .put(protect, updateActivity)
  .delete(protect, deleteActivity);
router.delete("/:id/leave", protect, leaveActivity);

export default router;