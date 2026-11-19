import { Crosshair, Loader2, Search, X } from "lucide-react";
import Button from "../common/Button";
import { CATEGORIES } from "../../utils/categories";
import { todayInputValue } from "../../utils/formatDate";

const RADIUS_OPTIONS = [5, 10, 25, 50];

const fieldClass =
  "rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/40";

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-primary/50 ${
        active ? "border-primary bg-primary text-white" : "border-gray-200 bg-white hover:border-primary"
      }`}
    >
      {children}
    </button>
  );
}

export default function ExploreFilters({
  searchText,
  onSearchChange,
  category,
  onCategoryChange,
  date,
  onDateChange,
  sort,
  onSortChange,
  geo,
  radius,
  onRadiusChange,
  hasFilters,
  onClearAll,
}) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <label htmlFor="search" className="sr-only">
          Search activities
        </label>
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/50" />
        <input
          id="search"
          type="search"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title or description"
          maxLength={100}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Only this row scrolls sideways on small screens, never the page */}
      <div className="-mx-4 overflow-x-auto px-4 pb-1">
        <div className="flex w-max gap-2" role="group" aria-label="Filter by category">
          <Chip active={!category} onClick={() => onCategoryChange("")}>
            All
          </Chip>
          {CATEGORIES.map(({ name, icon: Icon }) => (
            <Chip key={name} active={category === name} onClick={() => onCategoryChange(name)}>
              <Icon size={15} /> {name}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="date" className="text-xs font-semibold text-ink/70">
            Date
          </label>
          <input
            id="date"
            type="date"
            min={todayInputValue()}
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="sort" className="text-xs font-semibold text-ink/70">
            Sort by
          </label>
          <select id="sort" value={sort} onChange={(e) => onSortChange(e.target.value)} className={fieldClass}>
            <option value="upcoming">Upcoming first</option>
            <option value="newest">Newest listed</option>
          </select>
        </div>

        {geo.coords ? (
          <>
            <div className="flex flex-col gap-1">
              <label htmlFor="radius" className="text-xs font-semibold text-ink/70">
                Within
              </label>
              <select
                id="radius"
                value={radius}
                onChange={(e) => onRadiusChange(Number(e.target.value))}
                className={fieldClass}
              >
                {RADIUS_OPTIONS.map((km) => (
                  <option key={km} value={km}>
                    {km} km
                  </option>
                ))}
              </select>
            </div>
            <Button variant="outline" onClick={geo.clear}>
              <X size={16} /> Stop using location
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={geo.request} disabled={geo.locating}>
            {geo.locating ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
            {geo.locating ? "Locating..." : "Near me"}
          </Button>
        )}

        {hasFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="ml-auto text-sm font-semibold underline underline-offset-2"
          >
            Clear all
          </button>
        )}
      </div>

      {geo.error && (
        <p role="alert" className="text-sm text-red-600">
          {geo.error}
        </p>
      )}
    </div>
  );
}