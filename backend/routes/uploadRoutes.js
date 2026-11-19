import express from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadLimiter } from "../middleware/rateLimiter.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/image", protect, uploadLimiter, upload.single("image"), uploadImage);

export default router;