import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Calendar, Clock, CloudOff, ExternalLink, MapPin } from "lucide-react";
import JoinButton from "../components/activities/JoinButton";
import LocationMap from "../components/activities/LocationMap";
import Avatar from "../components/common/Avatar";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import useAuth from "../hooks/useAuth";
import useFetch from "../hooks/useFetch";
import { getActivityById } from "../services/activityService";
import { createJoinRequest, getSentRequests } from "../services/joinRequestService";
import { getCategoryIcon } from "../utils/categories";
import { formatFullDate, formatTime, getEndDate } from "../utils/formatDate";
import { getJoinState } from "../utils/joinState";

function DetailsSkeleton() {
  return (
    <div role="status" aria-label="Loading activity" className="mx-auto w-full max-w-6xl animate-pulse px-4 py-10">
      <div className="aspect-[16/7] rounded-3xl bg-peach/60" />
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="h-8 w-2/3 rounded bg-gray-100" />
          <div className="h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-5/6 rounded bg-gray-100" />
        </div>
        <div className="h-64 rounded-3xl bg-gray-100" />
      </div>
    </div>
  );
}

export default function ActivityDetailsPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [joining, setJoining] = useState(false);

  const activityQuery = useFetch(() => getActivityById(id), [id]);
  // Guests have no requests, so skip the API call for them
  const requestsQuery = useFetch(
    () => (user ? getSentRequests() : Promise.resolve({ data: { requests: [] } })),
    [user?._id]
  );

  const handleJoin = async () => {
    if (!user) {
      navigate("/login", { state: { from: location } }); // login sends them back here
      return;
    }

    setJoining(true);
    try {
      await createJoinRequest(id);
      toast.success("Request sent! The host will review it.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't send your request");
    } finally {
      setJoining(false);
      // success or failure, re-sync with the server's truth
      activityQuery.reload();
      requestsQuery.reload();
    }
  };

  const activity = activityQuery.data?.activity;

  if (activityQuery.loading && activity?._id !== id) return <DetailsSkeleton />;

  if (activityQuery.error) {
    return (
      <div className="flex flex-1 items-center px-4 py-16">
        <EmptyState icon={CloudOff} title="Couldn't load this activity" message={activityQuery.error}>
          <div className="flex gap-3">
            <Button variant="outline" onClick={activityQuery.reload}>Try again</Button>
            <Button to="/explore">Back to Explore</Button>
          </div>
        </EmptyState>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(activity.category);
  const start = new Date(activity.date);
  const end = getEndDate(activity);
  const [lng, lat] = activity.location.coordinates.coordinates;
  const filled = activity.participants.length;
  const percentFilled = Math.round((filled / activity.maxParticipants) * 100);

  const myRequest = requestsQuery.data?.requests.find((r) => r.activity?._id === activity._id);
  const ready = !authLoading && !requestsQuery.loading;
  const joinState = ready ? getJoinState({ activity, user, request: myRequest }) : "loading";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline">
        <ArrowLeft size={16} /> Back to Explore
      </Link>

      {activity.status === "cancelled" && (
        <p role="status" className="mt-4 rounded-2xl bg-peach px-4 py-3 text-sm font-semibold">
          This activity was cancelled by the host.
        </p>
      )}
      {activity.status !== "cancelled" && start <= new Date() && (
        <p role="status" className="mt-4 rounded-2xl bg-peach px-4 py-3 text-sm font-semibold">
          This activity has already started or finished.
        </p>
      )}

      <div className="mt-4 aspect-[16/7] overflow-hidden rounded-3xl bg-peach">
        {activity.coverImage ? (
          <img src={activity.coverImage} alt={`Cover for ${activity.title}`} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-primary/60">
            <CategoryIcon size={56} />
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Join card comes first in the page so it's near the top on phones */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:col-start-3 lg:row-start-1 lg:self-start">
          <div className="space-y-5 rounded-3xl bg-white p-6 shadow-sm">
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 font-semibold">
                <Calendar size={16} className="shrink-0 text-primary" />
                {formatFullDate(activity.date)}
              </p>
              <p className="flex items-center gap-2 text-ink/70">
                <Clock size={16} className="shrink-0 text-primary" />
                {formatTime(start)}
                {end && ` – ${formatTime(end)}`}
              </p>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-semibold">
                  {filled} / {activity.maxParticipants} joined
                </span>
                <span className="text-ink/70">
                  {activity.availableSlots > 0 ? `${activity.availableSlots} spots left` : "No spots left"}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label="Spots filled"
                aria-valuenow={filled}
                aria-valuemin={0}
                aria-valuemax={activity.maxParticipants}
                className="h-2 overflow-hidden rounded-full bg-gray-100"
              >
                <div className="h-full rounded-full bg-primary" style={{ width: `${percentFilled}%` }} />
              </div>
            </div>

            <JoinButton state={joinState} joining={joining} onJoin={handleJoin} />
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink/60">Hosted by</p>
            <Link to={`/profile/${activity.host._id}`} className="flex items-center gap-3">
              <Avatar user={activity.host} size="md" />
              <span className="font-bold">{activity.host.name}</span>
            </Link>
            {activity.host.bio && <p className="mt-3 line-clamp-3 text-sm text-ink/70">{activity.host.bio}</p>}
          </div>
        </aside>

        <div className="space-y-8 lg:col-span-2 lg:col-start-1 lg:row-start-1">
          <section>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-peach px-3 py-1 text-xs font-semibold">
              <CategoryIcon size={14} className="text-primary" /> {activity.category}
            </span>
            <h1 className="mt-3 break-words text-3xl font-extrabold leading-tight sm:text-4xl">{activity.title}</h1>
            <p className="mt-4 whitespace-pre-line break-words text-ink/80">{activity.description}</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">Where</h2>
            <p className="mb-3 flex items-start gap-2">
              <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
              {activity.location.address}
            </p>
            <LocationMap coordinates={activity.location.coordinates.coordinates} />
            <a
              href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2"
            >
              Open in OpenStreetMap <ExternalLink size={14} />
            </a>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">Who's going ({filled})</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {activity.participants.map((person) => (
                <li key={person._id}>
                  <Link
                    to={`/profile/${person._id}`}
                    className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm transition hover:shadow-md"
                  >
                    <Avatar user={person} size="sm" />
                    <span className="truncate text-sm font-semibold">{person.name}</span>
                    {person._id === activity.host._id && (
                      <span className="ml-auto rounded-full bg-peach px-2 py-0.5 text-xs font-semibold">Host</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}