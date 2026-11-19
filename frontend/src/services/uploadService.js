import api from "./api";

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("image", file); // field name must match upload.single("image") on the backend
  return api.post("/uploads/image", formData);
};