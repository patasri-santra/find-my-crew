import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CalendarDays, CloudOff, MapPin, Pencil } from "lucide-react";
import ActivityCard from "../components/activities/ActivityCard";
import Avatar from "../components/common/Avatar";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import AvatarUpload from "../components/profile/AvatarUpload";
import ProfileForm from "../components/profile/ProfileForm";
import useAuth from "../hooks/useAuth";
import useFetch from "../hooks/useFetch";
import { getUserProfile, updateProfile } from "../services/userService";
import { formatMonthYear } from "../utils/formatDate";

function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Loading profile" className="mx-auto w-full max-w-5xl animate-pulse px-4 py-10">
      <div className="h-64 rounded-3xl bg-white shadow-sm" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-64 rounded-3xl bg-white shadow-sm" />
        <div className="h-64 rounded-3xl bg-white shadow-sm" />
      </div>
    </div>
  );
}

function ActivityGridSection({ title, activities, emptyText, emptyAction }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {activities.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 text-sm text-ink/70 shadow-sm">
          <p>{emptyText}</p>
          {emptyAction && <div className="mt-3">{emptyAction}</div>}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <ActivityCard key={activity._id} activity={activity} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function ProfilePage() {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const { data, loading, error, reload } = useFetch(() => getUserProfile(id), [id]);

  useEffect(() => {
    setEditing(false); // opening another profile never starts in edit mode
  }, [id]);

  if (loading && data?.user._id !== id) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="flex flex-1 items-center px-4 py-16">
        <EmptyState icon={CloudOff} title="Couldn't load this profile" message={error}>
          <div className="flex gap-3">
            <Button variant="outline" onClick={reload}>Try again</Button>
            <Button to="/explore">Explore activities</Button>
          </div>
        </EmptyState>
      </div>
    );
  }

  const { user: profile, stats, hostedActivities, joinedActivities } = data;
  const isOwner = user?._id === profile._id;

  // keep the navbar (AuthContext) and this page in sync after any change
  const handleUserUpdated = (updatedUser) => {
    updateUser(updatedUser);
    reload();
  };

  const handleSave = async (payload) => {
    try {
      const { data: result } = await updateProfile(payload);
      handleUserUpdated(result.user);
      toast.success("Profile updated");
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save your profile");
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {isOwner ? (
            <AvatarUpload user={profile} onUserUpdated={handleUserUpdated} />
          ) : (
            <Avatar user={profile} size="lg" />
          )}

          <div className="min-w-0 flex-1 text-center sm:text-left">
            {isOwner && editing ? (
              <ProfileForm
                initialValues={{
                  name: profile.name,
                  bio: profile.bio || "",
                  locationLabel: profile.locationLabel || "",
                  interests: (profile.interests || []).join(", "),
                }}
                onSubmit={handleSave}
                onCancel={() => setEditing(false)}
              />
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-between">
                  <h1 className="break-words text-3xl font-extrabold">{profile.name}</h1>
                  {isOwner && (
                    <Button variant="outline" onClick={() => setEditing(true)}>
                      <Pencil size={16} /> Edit profile
                    </Button>
                  )}
                </div>

                <ul className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-ink/70 sm:justify-start">
                  {profile.locationLabel && (
                    <li className="flex items-center gap-1.5">
                      <MapPin size={15} className="text-primary" /> {profile.locationLabel}
                    </li>
                  )}
                  <li className="flex items-center gap-1.5">
                    <CalendarDays size={15} className="text-primary" /> Member since {formatMonthYear(profile.createdAt)}
                  </li>
                </ul>

                {profile.bio ? (
                  <p className="mt-4 whitespace-pre-line break-words text-ink/80">{profile.bio}</p>
                ) : (
                  isOwner && <p className="mt-4 text-sm text-ink/60">Add a short bio so people know what you're into.</p>
                )}

                {profile.interests?.length > 0 && (
                  <ul className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                    {profile.interests.map((interest) => (
                      <li key={interest} className="rounded-full bg-peach px-3 py-1 text-sm font-semibold">
                        {interest}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 text-center">
          <div>
            <dd className="text-3xl font-extrabold">{stats.hosted}</dd>
            <dt className="text-sm text-ink/70">Hosted</dt>
          </div>
          <div>
            <dd className="text-3xl font-extrabold">{stats.joined}</dd>
            <dt className="text-sm text-ink/70">Joined</dt>
          </div>
        </dl>
      </section>

      <ActivityGridSection
        title="Upcoming activities hosted"
        activities={hostedActivities}
        emptyText="No upcoming hosted activities."
        emptyAction={isOwner && <Button to="/create-activity">Create an Activity</Button>}
      />
      <ActivityGridSection
        title="Upcoming activities joined"
        activities={joinedActivities}
        emptyText="Not signed up for anything upcoming."
        emptyAction={isOwner && <Button to="/explore" variant="outline">Find something to join</Button>}
      />
    </div>
  );
}