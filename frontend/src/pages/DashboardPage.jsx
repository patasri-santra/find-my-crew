import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarPlus, Compass, Crosshair, Loader2, MapPin, Plus, Search, Sparkles } from "lucide-react";
import ActivitySection from "../components/activities/ActivitySection";
import CategoryGrid from "../components/activities/CategoryGrid";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import useAuth from "../hooks/useAuth";
import useFetch from "../hooks/useFetch";
import useGeolocation from "../hooks/useGeolocation";
import { getNearbyActivities, getRecommendedActivities } from "../services/activityService";
import { getMyJoined } from "../services/myActivityService";
import { getActivityPhase } from "../utils/activityPhase";

const NEARBY_KM = 25;

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const geo = useGeolocation();
  const [search, setSearch] = useState("");

  const joinedQuery = useFetch(() => getMyJoined(), []);
  const recommendedQuery = useFetch(() => getRecommendedActivities({ limit: 6 }), []);
  const nearbyQuery = useFetch(
    () =>
      geo.coords
        ? getNearbyActivities({ lat: geo.coords.lat, lng: geo.coords.lng, radius: NEARBY_KM, limit: 3 })
        : Promise.resolve({ data: { activities: [] } }),
    [geo.coords]
  );

  // If location permission was already granted earlier, load nearby results silently.
  // Nothing is ever asked on page load: the prompt only appears when you click the button.
  useEffect(() => {
    if (!navigator.permissions?.query) return;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (status.state === "granted") geo.request();
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const q = search.trim();
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
  };

  const firstName = user.name.split(" ")[0];

  const nearbyPrompt = (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-sm text-ink/70">
          <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
          Allow your location to see activities close to you. It's only used for this search and isn't saved to your
          profile.
        </p>
        <Button onClick={geo.request} disabled={geo.locating} className="shrink-0">
          {geo.locating ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
          {geo.locating ? "Locating..." : "Show activities near me"}
        </Button>
      </div>
      {geo.error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {geo.error}{" "}
          <Link to="/explore" className="font-semibold underline underline-offset-2">
            Browse all activities instead
          </Link>
        </p>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Welcome back, {firstName}!</h1>
          <p className="mt-1 text-ink/70">Here's what's happening around you.</p>
        </div>
        <Button to="/create-activity" size="lg">
          <Plus size={18} /> Create Activity
        </Button>
      </div>

      <form onSubmit={handleSearch} role="search" className="relative mt-8 flex gap-3">
        <label htmlFor="dashboard-search" className="sr-only">
          Search activities
        </label>
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/50" />
        <input
          id="dashboard-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxLength={100}
          placeholder="Search activities, e.g. badminton, coding, cafe"
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
        />
        <Button type="submit">Search</Button>
      </form>

      <ActivitySection
        title="Your upcoming activities"
        viewAllTo="/my-activities?tab=joined"
        query={joinedQuery}
        getItems={(data) =>
          data.activities
            .filter((activity) => getActivityPhase(activity) === "upcoming")
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3)
        }
        empty={
          <EmptyState
            icon={CalendarPlus}
            title="Nothing coming up yet"
            message="Join an activity and it will show up here."
          >
            <Button to="/explore">Explore Activities</Button>
          </EmptyState>
        }
      />

      <ActivitySection
        title="Recommended for you"
        subtitle={
          recommendedQuery.data &&
          (recommendedQuery.data.basedOnInterests ? (
            "Matched to your interests"
          ) : (
            <>
              Happening soon.{" "}
              <Link to={`/profile/${user._id}`} className="font-semibold underline underline-offset-2">
                Add interests to your profile
              </Link>{" "}
              for better picks.
            </>
          ))
        }
        viewAllTo="/explore"
        query={recommendedQuery}
        getItems={(data) => data.activities}
        empty={
          <EmptyState
            icon={Sparkles}
            title="No picks right now"
            message="There's nothing upcoming with open spots. Be the first to host something."
          >
            <Button to="/create-activity">Create an Activity</Button>
          </EmptyState>
        }
      />

      <ActivitySection
        title="Near you"
        subtitle={geo.coords ? `Within ${NEARBY_KM} km, closest first` : undefined}
        viewAllTo="/explore"
        query={nearbyQuery}
        getItems={(data) => data.activities}
        override={geo.coords ? null : nearbyPrompt}
        empty={
          <EmptyState
            icon={Compass}
            title={`Nothing within ${NEARBY_KM} km yet`}
            message="Host an activity in your area and get things started."
          >
            <Button to="/create-activity">Create an Activity</Button>
          </EmptyState>
        }
      />

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold">Popular categories</h2>
        <CategoryGrid />
      </section>
    </div>
  );
}