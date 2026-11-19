import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ActivityForm from "../components/activities/ActivityForm";
import { createActivity } from "../services/activityService";

export default function CreateActivityPage() {
  const navigate = useNavigate();

  const handleCreate = async (payload) => {
    try {
      const { data } = await createActivity(payload);
      toast.success("Activity published!");
      navigate(`/activities/${data.activity._id}`);
    } catch (err) {
      // the form keeps its values, so nothing is lost
      toast.error(err.response?.data?.message || "Couldn't publish your activity");
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Create an activity</h1>
      <p className="mt-2 text-ink/70">Tell people what you're planning and where to meet.</p>
      <div className="mt-8">
        <ActivityForm onSubmit={handleCreate} />
      </div>
    </div>
  );
}