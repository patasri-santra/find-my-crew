// One pure function decides which button the page shows. Order matters.
export const getJoinState = ({ activity, user, request }) => {
  if (user && activity.host._id === user._id) return "host";
  if (activity.status === "cancelled") return "cancelled";
  if (new Date(activity.date) <= new Date()) return "ended";
  if (!user) return "guest";
  if (activity.participants.some((p) => p._id === user._id)) return "joined";
  if (request?.status === "pending") return "pending";
  if (request?.status === "rejected") return "rejected";
  if (activity.availableSlots <= 0) return "full";
  return "open";
};