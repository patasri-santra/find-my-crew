import express from "express";
import { getUserProfile, updateProfile, updateProfileImage } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:id", getUserProfile);
router.put("/profile", protect, updateProfile);
router.put("/profile-image", protect, updateProfileImage);

export default router;