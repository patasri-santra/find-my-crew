import api from "./api";

export const getActivities = (params = {}) => api.get("/activities", { params });