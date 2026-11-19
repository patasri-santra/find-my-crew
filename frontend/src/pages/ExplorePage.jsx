import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarPlus, CloudOff, SearchX } from "lucide-react";
import ActivityCard from "../components/activities/ActivityCard";
import ActivityCardSkeleton from "../components/activities/ActivityCardSkeleton";
import ExploreFilters from "../components/activities/ExploreFilters";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import Pagination from "../components/common/Pagination";
import useDebounce from "../hooks/useDebounce";
import useFetch from "../hooks/useFetch";
import useGeolocation from "../hooks/useGeolocation";
import { getActivities } from "../services/activityService";
import { CATEGORIES } from "../utils/categories";
import { getDayRange } from "../utils/formatDate";

const PAGE_SIZE = 12;
const gridClass = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const geo = useGeolocation();
  const [radius, setRadius] = useState(10);

  // Read the URL, ignoring anything invalid (people can edit the address bar)
  const q = searchParams.get("q") || "";
  const rawCategory = searchParams.get("category");
  const category = CATEGORIES.some((c) => c.name === rawCategory) ? rawCategory : "";
  const sort = searchParams.get("sort") === "newest" ? "newest" : "upcoming";
  const dayRange = getDayRange(searchParams.get("date") || "");
  const date = dayRange ? searchParams.get("date") : "";
  const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);

  const [searchText, setSearchText] = useState(q);
  const debouncedSearch = useDebounce(searchText, 400);

  // Empty values remove the param; any change except `page` sends you back to page 1
  const updateParams = (changes) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
        if (!("page" in changes)) next.delete("page");
        return next;
      },
      { replace: true }
    );
  };

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (trimmed !== q) updateParams({ q: trimmed });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data, loading, error, reload } = useFetch(
    () =>
      getActivities({
        q: q || undefined,
        category: category || undefined,
        sort,
        page,
        limit: PAGE_SIZE,
        from: dayRange?.from,
        to: dayRange?.to,
        ...(geo.coords && { lat: geo.coords.lat, lng: geo.coords.lng, radius }),
      }),
    [q, category, sort, page, date, geo.coords, radius]
  );

  const hasFilters = Boolean(q || category || date || geo.coords);

  const clearAll = () => {
    setSearchText("");
    geo.clear();
    setSearchParams({}, { replace: true });
  };

  const changePage = (nextPage) => {
    updateParams({ page: nextPage > 1 ? String(nextPage) : "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  let content;
  if (loading && !data) {
    content = (
      <div className={gridClass}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <ActivityCardSkeleton key={n} />
        ))}
      </div>
    );
  } else if (error) {
    content = (
      <EmptyState icon={CloudOff} title="Couldn't load activities" message={error}>
        <Button variant="outline" onClick={reload}>Try again</Button>
      </EmptyState>
    );
  } else if (data.activities.length === 0) {
    content = hasFilters ? (
      <EmptyState
        icon={SearchX}
        title="No activities match your filters"
        message="Try a different search, a wider distance, or clear your filters."
      >
        <Button variant="outline" onClick={clearAll}>Clear filters</Button>
      </EmptyState>
    ) : (
      <EmptyState
        icon={CalendarPlus}
        title="No upcoming activities yet"
        message="Be the first to host one and get your crew together."
      >
        <Button to="/create-activity">Create an Activity</Button>
      </EmptyState>
    );
  } else {
    content = (
      <>
        <p className="mb-4 text-sm text-ink/70" aria-live="polite">
          {data.total} {data.total === 1 ? "activity" : "activities"} found
        </p>
        {/* While a new page of results loads, keep the old cards visible but dimmed */}
        <div className={`${gridClass} transition-opacity ${loading ? "opacity-60" : ""}`}>
          {data.activities.map((activity) => (
            <ActivityCard key={activity._id} activity={activity} />
          ))}
        </div>
        <Pagination page={data.page} pages={data.pages} onChange={changePage} />
      </>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Explore activities</h1>
      <p className="mt-2 text-ink/70">Find something to do and people to do it with.</p>

      <div className="mt-6">
        <ExploreFilters
          searchText={searchText}
          onSearchChange={setSearchText}
          category={category}
          onCategoryChange={(name) => updateParams({ category: name })}
          date={date}
          onDateChange={(value) => updateParams({ date: value })}
          sort={sort}
          onSortChange={(value) => updateParams({ sort: value === "upcoming" ? "" : value })}
          geo={geo}
          radius={radius}
          onRadiusChange={setRadius}
          hasFilters={hasFilters}
          onClearAll={clearAll}
        />
      </div>

      <div className="mt-8">{content}</div>
    </div>
  );
}