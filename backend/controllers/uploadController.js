import cloudinary from "../config/cloudinary.js";
import { httpError } from "../utils/httpError.js";

// POST /api/uploads/image  (multipart/form-data, field name: "image")
export const uploadImage = async (req, res) => {
  if (!req.file) throw httpError(400, "Please attach an image in the 'image' field");

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: "find-my-crew", resource_type: "image", allowed_formats: ["jpg", "png", "webp"] },
        (error, uploaded) => {
          if (error) {
            console.error("Cloudinary upload failed:", error.message);
            return reject(httpError(502, "Image upload failed, please try again"));
          }
          resolve(uploaded);
        }
      )
      .end(req.file.buffer);
  });

  res.status(201).json({ success: true, url: result.secure_url });
};