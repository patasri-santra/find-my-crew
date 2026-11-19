import { Ban, CalendarX, Check, Clock, History, Settings, Users } from "lucide-react";
import Button from "../common/Button";

// States that are information, not actions, render as a status pill
const STATUS = {
  joined: { label: "Joined", icon: Check, className: "bg-success/20 text-ink" },
  pending: { label: "Request Pending", icon: Clock, className: "bg-peach text-ink" },
  rejected: { label: "Request Declined", icon: Ban, className: "bg-gray-100 text-ink/70" },
  full: { label: "Activity Full", icon: Users, className: "bg-gray-100 text-ink/70" },
  cancelled: { label: "Activity Cancelled", icon: CalendarX, className: "bg-gray-100 text-ink/70" },
  ended: { label: "Activity Ended", icon: History, className: "bg-gray-100 text-ink/70" },
};

export default function JoinButton({ state, joining, onJoin }) {
  if (state === "loading") {
    return (
      <Button size="lg" className="w-full" disabled>
        Loading...
      </Button>
    );
  }

  if (state === "host") {
    return (
      <Button to="/my-activities" size="lg" className="w-full">
        <Settings size={18} /> Manage Activity
      </Button>
    );
  }

  if (state === "guest" || state === "open") {
    return (
      <Button size="lg" className="w-full" onClick={onJoin} disabled={joining}>
        {joining ? "Sending..." : "Request to Join"}
      </Button>
    );
  }

  const { label, icon: Icon, className } = STATUS[state];
  return (
    <p
      role="status"
      className={`flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold ${className}`}
    >
      <Icon size={18} /> {label}
    </p>
  );
}