import { Link } from "react-router-dom";
import { CATEGORIES } from "../../utils/categories";

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {CATEGORIES.map(({ name, icon: Icon }) => (
        <Link
          key={name}
          to={`/explore?category=${encodeURIComponent(name)}`}
          className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm outline-none transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-peach text-primary">
            <Icon size={20} />
          </span>
          <span className="text-sm font-semibold">{name}</span>
        </Link>
      ))}
    </div>
  );
}