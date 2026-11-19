import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CalendarPlus, CloudOff, Compass, Inbox, Pencil, Send } from "lucide-react";
import MyActivityRow from "../components/activities/MyActivityRow";
import RequestRow from "../components/activities/RequestRow";
import Avatar from "../components/common/Avatar";
import Button from "../components/common/Button";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import useFetch from "../hooks/useFetch";
import { cancelActivity, deleteActivity, leaveActivity } from "../services/activityService";
import { acceptRequest, getReceivedRequests, getSentRequests, rejectRequest } from "../services/joinRequestService";
import { getMyCreated, getMyJoined } from "../services/myActivityService";
import { getActivityPhase } from "../utils/activityPhase";

const TABS = [
  { key: "created", label: "Created" },
  { key: "joined", label: "Joined" },
  { key: "requests", label: "Requests" },
];

function RowSkeletons() {
  return (
    <div role="status" aria-label="Loading" className="space-y-4">
      {[1, 2].map((n) => (
        <div key={n} className="h-36 animate-pulse rounded-3xl bg-white shadow-sm" />
      ))}
    </div>
  );
}

// Handles loading / error / empty for one list, then hands the items to `children`
function Section({ query, getItems, empty, children }) {
  if (query.loading && !query.data) return <RowSkeletons />;

  if (query.error) {
    return (
      <EmptyState icon={CloudOff} title="Couldn't load this" message={query.error}>
        <Button variant="outline" onClick={query.reload}>Try again</Button>
      </EmptyState>
    );
  }

  const items = getItems(query.data);
  return items.length === 0 ? empty : children(items);
}

function CreatedItem({ activity, pendingCount, onCancel, onDelete }) {
  const upcoming = getActivityPhase(activity) === "upcoming";

  return (
    <MyActivityRow activity={activity}>
      <div className="flex flex-wrap items-center gap-3">
        {upcoming && (
          <>
            <Button to={`/activities/${activity._id}/edit`} variant="outline">
              <Pencil size={16} /> Edit
            </Button>
            <Button variant="outline" onClick={onCancel}>Cancel activity</Button>
          </>
        )}
        <button type="button" onClick={onDelete} className="text-sm font-semibold text-red-600 hover:underline">
          Delete
        </button>
        {pendingCount > 0 && (
          <Link to="?tab=requests" className="ml-auto rounded-full bg-peach px-3 py-1 text-xs font-semibold">
            {pendingCount} pending {pendingCount === 1 ? "request" : "requests"}
          </Link>
        )}
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold">
          View participants ({activity.participants.length})
        </summary>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {activity.participants.map((person) => (
            <li key={person._id}>
              <Link to={`/profile/${person._id}`} className="flex items-center gap-2 text-sm">
                <Avatar user={person} size="sm" />
                <span className="truncate">{person.name}</span>
                {person._id === activity.host && (
                  <span className="rounded-full bg-peach px-2 py-0.5 text-xs font-semibold">Host</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </MyActivityRow>
  );
}

function JoinedItem({ activity, onLeave }) {
  const upcoming = getActivityPhase(activity) === "upcoming";

  return (
    <MyActivityRow activity={activity}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/70">
          Hosted by{" "}
          <Link to={`/profile/${activity.host._id}`} className="font-semibold text-ink hover:underline">
            {activity.host.name}
          </Link>
        </p>
        {upcoming && (
          <Button variant="outline" onClick={onLeave}>Leave</Button>
        )}
      </div>
    </MyActivityRow>
  );
}

export default function MyActivitiesPage() {
  const [searchParams] = useSearchParams();
  const tab = TABS.some((t) => t.key === searchParams.get("tab")) ? searchParams.get("tab") : "created";

  const createdQuery = useFetch(() => getMyCreated(), []);
  const joinedQuery = useFetch(() => getMyJoined(), []);
  const receivedQuery = useFetch(() => getReceivedRequests("pending"), []);
  const sentQuery = useFetch(() => getSentRequests(), []);

  const [busyRequestId, setBusyRequestId] = useState(null);
  const [pendingConfirm, setPendingConfirm] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  // After any change, refetch from the server so the screen can never drift from the database
  const reloadAll = () => {
    createdQuery.reload();
    joinedQuery.reload();
    receivedQuery.reload();
    sentQuery.reload();
  };

  const respondToRequest = async (request, action) => {
    setBusyRequestId(request._id);
    try {
      if (action === "accept") {
        await acceptRequest(request._id);
        toast.success(`${request.requester.name} is now in your activity`);
      } else {
        await rejectRequest(request._id);
        toast.success("Request declined");
      }
    } catch (err) {
      // e.g. "Activity is full" when someone else's accept landed first
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusyRequestId(null);
      reloadAll();
    }
  };

  const askConfirm = (type, activity) => {
    const configs = {
      cancel: {
        title: "Cancel this activity?",
        message: `"${activity.title}" will show as cancelled and pending requests can no longer be accepted. This can't be undone.`,
        confirmLabel: "Cancel activity",
        success: "Activity cancelled",
        run: () => cancelActivity(activity._id),
      },
      delete: {
        title: "Delete this activity?",
        message: `"${activity.title}" and all its join requests will be removed permanently.`,
        confirmLabel: "Delete",
        success: "Activity deleted",
        run: () => deleteActivity(activity._id),
      },
      leave: {
        title: "Leave this activity?",
        message: `You'll give up your spot in "${activity.title}". You can ask to join again later.`,
        confirmLabel: "Leave",
        success: "You left the activity",
        run: () => leaveActivity(activity._id),
      },
    };
    setPendingConfirm(configs[type]);
  };

  const runConfirmed = async () => {
    setConfirmBusy(true);
    try {
      await pendingConfirm.run();
      toast.success(pendingConfirm.success);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setConfirmBusy(false);
      setPendingConfirm(null);
      reloadAll();
    }
  };

  const receivedRequests = receivedQuery.data?.requests ?? [];
  const pendingByActivity = (activityId) => receivedRequests.filter((r) => r.activity._id === activityId).length;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">My activities</h1>
      <p className="mt-2 text-ink/70">Manage what you host, what you've joined, and who wants in.</p>

      <nav aria-label="My activities sections" className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map(({ key, label }) => (
          <Link
            key={key}
            to={`?tab=${key}`}
            aria-current={tab === key ? "page" : undefined}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-5 py-2 text-sm font-semibold transition ${
              tab === key ? "border-primary bg-primary text-white" : "border-gray-200 bg-white hover:border-primary"
            }`}
          >
            {label}
            {key === "requests" && receivedRequests.length > 0 && (
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-ink">{receivedRequests.length}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "created" && (
          <Section
            query={createdQuery}
            getItems={(data) => data.activities}
            empty={
              <EmptyState
                icon={CalendarPlus}
                title="You haven't created an activity yet"
                message="Host something and let people nearby join in."
              >
                <Button to="/create-activity">Create an Activity</Button>
              </EmptyState>
            }
          >
            {(items) => (
              <ul className="space-y-4">
                {items.map((activity) => (
                  <CreatedItem
                    key={activity._id}
                    activity={activity}
                    pendingCount={pendingByActivity(activity._id)}
                    onCancel={() => askConfirm("cancel", activity)}
                    onDelete={() => askConfirm("delete", activity)}
                  />
                ))}
              </ul>
            )}
          </Section>
        )}

        {tab === "joined" && (
          <Section
            query={joinedQuery}
            getItems={(data) => data.activities}
            empty={
              <EmptyState
                icon={Compass}
                title="You haven't joined any activities"
                message="Find one that sounds fun and send a request."
              >
                <Button to="/explore">Explore Activities</Button>
              </EmptyState>
            }
          >
            {(items) => (
              <ul className="space-y-4">
                {items.map((activity) => (
                  <JoinedItem key={activity._id} activity={activity} onLeave={() => askConfirm("leave", activity)} />
                ))}
              </ul>
            )}
          </Section>
        )}

        {tab === "requests" && (
          <div className="space-y-10">
            <section aria-labelledby="review-heading">
              <h2 id="review-heading" className="mb-4 text-xl font-bold">
                Waiting for your approval
              </h2>
              <Section
                query={receivedQuery}
                getItems={(data) => data.requests}
                empty={
                  <EmptyState
                    icon={Inbox}
                    title="No requests to review"
                    message="When someone asks to join one of your activities, it shows up here."
                  />
                }
              >
                {(items) => (
                  <ul className="space-y-4">
                    {items.map((request) => (
                      <RequestRow
                        key={request._id}
                        request={request}
                        mode="received"
                        busy={busyRequestId === request._id}
                        onAccept={() => respondToRequest(request, "accept")}
                        onReject={() => respondToRequest(request, "reject")}
                      />
                    ))}
                  </ul>
                )}
              </Section>
            </section>

            <section aria-labelledby="sent-heading">
              <h2 id="sent-heading" className="mb-4 text-xl font-bold">
                Waiting for a host's reply
              </h2>
              <Section
                query={sentQuery}
                getItems={(data) => data.requests.filter((r) => r.status === "pending")}
                empty={
                  <EmptyState
                    icon={Send}
                    title="No pending requests"
                    message="Requests you send to join activities will wait here for the host."
                  />
                }
              >
                {(items) => (
                  <ul className="space-y-4">
                    {items.map((request) => (
                      <RequestRow key={request._id} request={request} mode="sent" />
                    ))}
                  </ul>
                )}
              </Section>
            </section>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingConfirm)}
        title={pendingConfirm?.title}
        message={pendingConfirm?.message}
        confirmLabel={pendingConfirm?.confirmLabel}
        busy={confirmBusy}
        onConfirm={runConfirmed}
        onCancel={() => setPendingConfirm(null)}
      />
    </div>
  );
}