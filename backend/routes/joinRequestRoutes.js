import express from "express";
import {
  createJoinRequest,
  getReceivedRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
} from "../controllers/joinRequestController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // every join-request route needs a logged-in user

router.get("/received", getReceivedRequests);
router.get("/sent", getSentRequests);
router.post("/:activityId", createJoinRequest);
router.patch("/:requestId/accept", acceptRequest);
router.patch("/:requestId/reject", rejectRequest);

export default router;