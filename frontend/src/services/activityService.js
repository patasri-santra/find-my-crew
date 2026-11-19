import api from "./api";

export const getActivities = (params = {}) => api.get("/activities", { params });

export const getActivityById = (id) => api.get(`/activities/${id}`);