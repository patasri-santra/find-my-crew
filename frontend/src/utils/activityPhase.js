export const getActivityPhase = (activity) => {
  if (activity.status === "cancelled") return "cancelled";
  if (new Date(activity.date) <= new Date()) return "ended";
  return "upcoming";
};