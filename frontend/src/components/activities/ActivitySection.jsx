import { Link } from "react-router-dom";
import { ArrowRight, CloudOff } from "lucide-react";
import Button from "../common/Button";
import EmptyState from "../common/EmptyState";
import ActivityCard from "./ActivityCard";
import ActivityCardSkeleton from "./ActivityCardSkeleton";

const gridClass = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

// One "shelf" of activities. Each dashboard section hands it a different data source.
// `override` replaces the content entirely (used for the "allow location" prompt).
export default function ActivitySection({ title, subtitle, viewAllTo, query, getItems, empty, override }) {
  const items = query.data ? getItems(query.data) : [];

  let content;
  if (override) {
    content = override;
  } else if (query.loading && !query.data) {
    content = (
      <div className={gridClass}>
        {[1, 2, 3].map((n) => (
          <ActivityCardSkeleton key={n} />
        ))}
      </div>
    );
  } else if (query.error) {
    content = (
      <EmptyState icon={CloudOff} title="Couldn't load this" message={query.error}>
        <Button variant="outline" onClick={query.reload}>Try again</Button>
      </EmptyState>
    );
  } else if (items.length === 0) {
    content = empty;
  } else {
    content = (
      <div className={gridClass}>
        {items.map((activity) => (
          <ActivityCard key={activity._id} activity={activity} />
        ))}
      </div>
    );
  }

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-ink/70">{subtitle}</p>}
        </div>
        {viewAllTo && (
          <Link to={viewAllTo} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold hover:underline">
            View all <ArrowRight size={16} />
          </Link>
        )}
      </div>
      {content}
    </section>
  );
}