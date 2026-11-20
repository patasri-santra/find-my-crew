import api from "./api";

export const getUserProfile = (id) => api.get(`/users/${id}`);
export const updateProfile = (payload) => api.put("/users/profile", payload);
export const updateProfileImage = (profileImage) => api.put("/users/profile-image", { profileImage });