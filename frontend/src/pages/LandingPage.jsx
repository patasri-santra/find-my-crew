import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarPlus,
  CloudOff,
  Heart,
  MapPin,
  Search,
  Send,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import ActivityCard from "../components/activities/ActivityCard";
import ActivityCardSkeleton from "../components/activities/ActivityCardSkeleton";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import useAuth from "../hooks/useAuth";
import useFetch from "../hooks/useFetch";
import { getActivities } from "../services/activityService";
import CategoryGrid from "../components/activities/CategoryGrid";

const STEPS = [
  { icon: Search, title: "Discover", text: "Browse activities near you by category, date or distance." },
  { icon: Send, title: "Request to join", text: "Ask to join with one tap. The host reviews and accepts requests." },
  { icon: Users, title: "Meet your crew", text: "Show up, meet new people and share the moment." },
];

const BENEFITS = [
  { icon: MapPin, title: "Close to home", text: "Find activities and people around your neighbourhood." },
  { icon: ShieldCheck, title: "Host-approved groups", text: "Every join request is reviewed by the host, so groups stay friendly." },
  { icon: Zap, title: "Start in minutes", text: "Create an activity in a minute and let people find you." },
  { icon: Heart, title: "Any interest, any level", text: "From badminton to coding sessions, there is a crew for everyone." },
];

const gridClass = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

function FeaturedActivities() {
  const { data, loading, error, reload } = useFetch(() => getActivities({ limit: 3 }));

  if (loading) {
    return (
      <div className={gridClass}>
        {[1, 2, 3].map((n) => (
          <ActivityCardSkeleton key={n} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState icon={CloudOff} title="Couldn't load activities" message={error}>
        <Button variant="outline" onClick={reload}>Try again</Button>
      </EmptyState>
    );
  }

  if (data.activities.length === 0) {
    return (
      <EmptyState
        icon={CalendarPlus}
        title="No upcoming activities yet"
        message="Be the first to host one and get your crew together."
      >
        <Button to="/create-activity">Create an Activity</Button>
      </EmptyState>
    );
  }

  return (
    <div className={gridClass}>
      {data.activities.map((activity) => (
        <ActivityCard key={activity._id} activity={activity} />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 text-center sm:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full bg-peach px-4 py-1.5 text-sm font-semibold">
          <MapPin size={14} className="text-primary" /> Activities near you
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Find your people. <span className="text-primary">Share your moments.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink/70">
          Find My Crew connects you with people nearby who love the same things, from badminton and café
          hops to coding sessions and photo walks.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button to="/explore" size="lg">
            Explore Activities <ArrowRight size={18} />
          </Button>
          <Button to="/create-activity" variant="secondary" size="lg">
            Create an Activity
          </Button>
        </div>
      </section>

      {/* Featured activities (live from the API) */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-extrabold">Featured activities</h2>
          <Link to="/explore" className="inline-flex items-center gap-1 text-sm font-semibold hover:underline">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <FeaturedActivities />
      </section>

      {/* Categories */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-extrabold">Popular categories</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <CategoryGrid />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mt-8 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center text-2xl font-extrabold">How it works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="flex flex-col items-center text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-peach text-primary">
                  <Icon size={24} />
                </span>
                <h3 className="mt-4 text-lg font-bold">
                  {index + 1}. {title}
                </h3>
                <p className="mt-2 max-w-xs text-sm text-ink/70">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community benefits */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-2xl font-extrabold">Why you'll like it here</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl bg-peach/60 p-6">
              <Icon size={22} className="text-primary" />
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="mt-1.5 text-sm text-ink/70">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sign-up nudge */}
      {!loading && (
        <section className="mx-auto w-full max-w-6xl px-4">
          <div className="rounded-3xl bg-primary px-6 py-12 text-center text-white sm:px-12">
            <h2 className="text-3xl font-extrabold">
              {user ? "Got an idea for a meetup?" : "Ready to find your crew?"}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-white/90">
              {user
                ? "Host an activity and let people nearby join in."
                : "Create a free account and join your first activity today."}
            </p>
            <div className="mt-6">
              <Button to={user ? "/create-activity" : "/register"} variant="outline" size="lg">
                {user ? "Create an Activity" : "Join Find My Crew"}
              </Button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}