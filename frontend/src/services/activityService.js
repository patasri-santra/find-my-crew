import api from "./api";

export const getActivities = (params = {}) => api.get("/activities", { params });
export const getActivityById = (id) => api.get(`/activities/${id}`);
export const createActivity = (payload) => api.post("/activities", payload);
export const updateActivity = (id, payload) => api.put(`/activities/${id}`, payload);
export const cancelActivity = (id) => api.put(`/activities/${id}`, { status: "cancelled" });
export const deleteActivity = (id) => api.delete(`/activities/${id}`);
export const leaveActivity = (id) => api.delete(`/activities/${id}/leave`);
export const getRecommendedActivities = (params = {}) => api.get("/activities/recommended", { params });
export const getNearbyActivities = (params = {}) => api.get("/activities/nearby", { params });