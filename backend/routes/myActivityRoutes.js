import express from "express";
import { getMyCreatedActivities, getMyJoinedActivities } from "../controllers/activityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/created", getMyCreatedActivities);
router.get("/joined", getMyJoinedActivities);

export default router;