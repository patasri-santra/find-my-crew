import api from "./api";

export const createJoinRequest = (activityId) => api.post(`/join-requests/${activityId}`);
export const getSentRequests = () => api.get("/join-requests/sent");
export const getReceivedRequests = (status) => api.get("/join-requests/received", { params: { status } });
export const acceptRequest = (requestId) => api.patch(`/join-requests/${requestId}/accept`);
export const rejectRequest = (requestId) => api.patch(`/join-requests/${requestId}/reject`);