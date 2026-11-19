import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import { getActivityPhase } from "../../utils/activityPhase";
import { formatActivityDate, timeAgo } from "../../utils/formatDate";

const BLOCKED = {
  cancelled: "Activity was cancelled",
  ended: "Activity already started",
};

// mode "received": a host reviewing a request. mode "sent": your own pending request.
export default function RequestRow({ request, mode, busy, onAccept, onReject }) {
  const { activity } = request;

  if (mode === "sent") {
    return (
      <li className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-sm">
        <div className="min-w-0">
          <Link to={`/activities/${activity._id}`} className="font-bold hover:underline">
            {activity.title}
          </Link>
          <p className="text-sm text-ink/70">
            {formatActivityDate(activity.date)} · Host: {request.host.name}
          </p>
        </div>
        <span className="rounded-full bg-peach px-3 py-1 text-xs font-semibold">
          Waiting for host · {timeAgo(request.createdAt)}
        </span>
      </li>
    );
  }

  const { requester } = request;
  const phase = getActivityPhase(activity);
  const spotsLeft = activity.maxParticipants - activity.participants.length;
  const blockedReason = BLOCKED[phase] || (spotsLeft <= 0 ? "Activity is full" : "");

  return (
    <li className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar user={requester} size="md" />
        <div className="min-w-0 flex-1">
          <Link to={`/profile/${requester._id}`} className="font-bold hover:underline">
            {requester.name}
          </Link>
          <p className="text-xs text-ink/60">Requested {timeAgo(request.createdAt)}</p>
          {requester.bio && <p className="mt-2 line-clamp-2 text-sm text-ink/70">{requester.bio}</p>}
          {requester.interests?.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {requester.interests.slice(0, 4).map((interest) => (
                <li key={interest} className="rounded-full bg-peach px-2.5 py-0.5 text-xs font-semibold">
                  {interest}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm">
        Wants to join{" "}
        <Link to={`/activities/${activity._id}`} className="font-semibold underline underline-offset-2">
          {activity.title}
        </Link>{" "}
        <span className="text-ink/60">
          ({spotsLeft > 0 ? `${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"} left` : "full"})
        </span>
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={onAccept} disabled={busy || Boolean(blockedReason)}>
          <Check size={16} /> {busy ? "Working..." : "Accept"}
        </Button>
        <Button variant="outline" onClick={onReject} disabled={busy}>
          <X size={16} /> Decline
        </Button>
        {blockedReason && <span className="text-xs text-ink/60">{blockedReason}</span>}
      </div>
    </li>
  );
}