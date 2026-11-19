// `date` is the exact start moment, so the browser shows it in the viewer's own timezone
export const formatActivityDate = (isoString) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoString));

  // "2026-12-06" -> start and end of that day in the viewer's timezone, as ISO strings (null if invalid)
export const getDayRange = (dateString) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;

  const start = new Date(`${dateString}T00:00:00`);
  const end = new Date(`${dateString}T23:59:59.999`);
  if (Number.isNaN(start.getTime())) return null;

  return { from: start.toISOString(), to: end.toISOString() };
};

// Today's date as YYYY-MM-DD in local time, for <input type="date" min="...">
export const todayInputValue = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};