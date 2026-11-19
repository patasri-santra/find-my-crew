import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CloudOff, Lock } from "lucide-react";
import ActivityForm from "../components/activities/ActivityForm";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import useAuth from "../hooks/useAuth";
import useFetch from "../hooks/useFetch";
import { getActivityById, updateActivity } from "../services/activityService";
import { getActivityPhase } from "../utils/activityPhase";
import { getEndDate, toInputDate, toInputTime } from "../utils/formatDate";

// API shape -> form shape (times shown in the viewer's own timezone)
const toFormValues = (activity) => {
  const start = new Date(activity.date);
  const end = getEndDate(activity);
  const [lng, lat] = activity.location.coordinates.coordinates;

  return {
    title: activity.title,
    description: activity.description,
    category: activity.category,
    coverImage: activity.coverImage || "",
    date: toInputDate(start),
    startTime: toInputTime(start),
    endTime: end ? toInputTime(end) : "",
    address: activity.location.address,
    coordinates: { lat, lng },
    maxParticipants: activity.maxParticipants,
  };
};

function Centered({ children }) {
  return <div className="flex flex-1 items-center px-4 py-16">{children}</div>;
}

export default function EditActivityPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useFetch(() => getActivityById(id), [id]);

  if (loading && !data) {
    return (
      <Centered>
        <p role="status" className="mx-auto text-sm text-ink/70">Loading...</p>
      </Centered>
    );
  }

  if (error) {
    return (
      <Centered>
        <EmptyState icon={CloudOff} title="Couldn't load this activity" message={error}>
          <div className="flex gap-3">
            <Button variant="outline" onClick={reload}>Try again</Button>
            <Button to="/my-activities">Back</Button>
          </div>
        </EmptyState>
      </Centered>
    );
  }

  const { activity } = data;

  if (activity.host._id !== user._id) {
    return (
      <Centered>
        <EmptyState icon={Lock} title="Only the host can edit this" message="You can view this activity but not change it.">
          <Button to={`/activities/${id}`}>View activity</Button>
        </EmptyState>
      </Centered>
    );
  }

  if (getActivityPhase(activity) !== "upcoming") {
    return (
      <Centered>
        <EmptyState icon={Lock} title="This activity can't be edited" message="Cancelled or already-started activities are locked.">
          <Button to="/my-activities">Back to My Activities</Button>
        </EmptyState>
      </Centered>
    );
  }

  const handleSave = async (payload) => {
    try {
      await updateActivity(id, payload);
      toast.success("Changes saved");
      navigate(`/activities/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save your changes");
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link to="/my-activities" className="text-sm font-semibold hover:underline">
        ← Back to My Activities
      </Link>
      <h1 className="mt-3 text-3xl font-extrabold">Edit activity</h1>
      <div className="mt-8">
        <ActivityForm initialValues={toFormValues(activity)} onSubmit={handleSave} submitLabel="Save changes" />
      </div>
    </div>
  );
}