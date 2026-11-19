import { Link } from "react-router-dom";
import { Calendar, MapPin, Users } from "lucide-react";
import Avatar from "../common/Avatar";
import { getCategoryIcon } from "../../utils/categories";
import { formatActivityDate } from "../../utils/formatDate";

export default function ActivityCard({ activity }) {
  const CategoryIcon = getCategoryIcon(activity.category);
  const isFull = activity.availableSlots <= 0;

  return (
    <Link
      to={`/activities/${activity._id}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm outline-none transition hover:-translate-y-1 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <div className="relative aspect-[16/10] bg-peach">
        {activity.coverImage ? (
          <img src={activity.coverImage} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-primary/60">
            <CategoryIcon size={40} />
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold">
          <CategoryIcon size={14} className="text-primary" />
          {activity.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-lg font-bold leading-snug">{activity.title}</h3>

        <ul className="flex flex-col gap-1.5 text-sm text-ink/70">
          <li className="flex items-center gap-2">
            <Calendar size={15} className="shrink-0 text-primary" />
            {formatActivityDate(activity.date)}
          </li>
          <li className="flex items-center gap-2">
            <MapPin size={15} className="shrink-0 text-primary" />
            <span className="truncate">{activity.location.address}</span>
          </li>
        </ul>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar user={activity.host} size="sm" />
            <span className="truncate text-sm font-semibold">{activity.host.name}</span>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              isFull ? "bg-gray-100 text-ink/60" : "bg-success/20 text-ink"
            }`}
          >
            <Users size={13} />
            {isFull ? "Full" : `${activity.availableSlots} spots left`}
          </span>
        </div>
      </div>
    </Link>
  );
}