import { Link } from "react-router-dom";
import { Calendar, MapPin, Users } from "lucide-react";
import { getActivityPhase } from "../../utils/activityPhase";
import { getCategoryIcon } from "../../utils/categories";
import { formatActivityDate } from "../../utils/formatDate";

const PHASE_BADGE = {
  upcoming: ["Upcoming", "bg-success/20 text-ink"],
  ended: ["Ended", "bg-gray-100 text-ink/70"],
  cancelled: ["Cancelled", "bg-gray-100 text-ink/70"],
};

export default function MyActivityRow({ activity, children }) {
  const CategoryIcon = getCategoryIcon(activity.category);
  const [label, badgeClass] = PHASE_BADGE[getActivityPhase(activity)];

  return (
    <li className="rounded-3xl bg-white p-4 shadow-sm sm:p-5">
      <div className="flex gap-4">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-peach text-primary/60 sm:h-24 sm:w-24">
          {activity.coverImage ? (
            <img src={activity.coverImage} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <CategoryIcon size={28} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <Link to={`/activities/${activity._id}`} className="line-clamp-2 font-bold hover:underline">
              {activity.title}
            </Link>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}>{label}</span>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-ink/70">
            <li className="flex items-center gap-2">
              <Calendar size={14} className="shrink-0 text-primary" />
              {formatActivityDate(activity.date)}
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={14} className="shrink-0 text-primary" />
              <span className="truncate">{activity.location.address}</span>
            </li>
            <li className="flex items-center gap-2">
              <Users size={14} className="shrink-0 text-primary" />
              {activity.participants.length} / {activity.maxParticipants} joined
            </li>
          </ul>
        </div>
      </div>

      {children && <div className="mt-4 border-t border-gray-100 pt-4">{children}</div>}
    </li>
  );
}