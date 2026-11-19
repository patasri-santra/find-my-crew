import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const linkClass = "text-sm text-ink/70 transition hover:text-ink";

export default function Footer() {
  const { user, loading } = useAuth();

  return (
    <footer className="mt-16 border-t border-gray-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div className="space-y-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-white">
              <Compass size={18} />
            </span>
            Find My Crew
          </Link>
          <p className="max-w-xs text-sm text-ink/70">Find your people. Share your moments.</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold">Discover</h3>
          <ul className="space-y-2">
            <li><Link to="/explore" className={linkClass}>Explore activities</Link></li>
            <li><Link to="/create-activity" className={linkClass}>Create an activity</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold">Account</h3>
          {!loading && (
            <ul className="space-y-2">
              {user ? (
                <>
                  <li><Link to="/dashboard" className={linkClass}>Dashboard</Link></li>
                  <li><Link to="/my-activities" className={linkClass}>My activities</Link></li>
                  <li><Link to={`/profile/${user._id}`} className={linkClass}>Profile</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className={linkClass}>Log in</Link></li>
                  <li><Link to="/register" className={linkClass}>Sign up</Link></li>
                </>
              )}
            </ul>
          )}
        </div>
      </div>

      <p className="border-t border-gray-100 py-4 text-center text-xs text-ink/60">
        © {new Date().getFullYear()} Find My Crew
      </p>
    </footer>
  );
}