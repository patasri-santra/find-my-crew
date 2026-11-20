import { useState } from "react";
import toast from "react-hot-toast";
import { uploadImage } from "../services/uploadService";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 5;

export default function useImageUpload() {
  const [uploading, setUploading] = useState(false);

  // Resolves to the Cloudinary URL, or null if the file was rejected or the upload failed
  const upload = async (file) => {
    if (!file) return null;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please choose a JPG, PNG or WebP image");
      return null;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Image must be ${MAX_MB} MB or smaller`);
      return null;
    }

    setUploading(true);
    try {
      const { data } = await uploadImage(file);
      return data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed, please try again");
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploading, upload };
}