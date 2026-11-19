import api from "./api";

export const getMyCreated = () => api.get("/my-activities/created");
export const getMyJoined = () => api.get("/my-activities/joined");