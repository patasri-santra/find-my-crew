import api from "./api";

export const createJoinRequest = (activityId) => api.post(`/join-requests/${activityId}`);
export const getSentRequests = () => api.get("/join-requests/sent");