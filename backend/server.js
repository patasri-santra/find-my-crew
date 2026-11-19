import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import joinRequestRoutes from "./routes/joinRequestRoutes.js";
import myActivityRoutes from "./routes/myActivityRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

app.set("trust proxy", 1); // Render sits behind one proxy; needed for per-user rate limits
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use((req, res, next) => {
  req.body ??= {}; // Express 5 leaves req.body undefined when there is no body
  next();
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Find My Crew API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/join-requests", joinRequestRoutes);
app.use("/api/my-activities", myActivityRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});