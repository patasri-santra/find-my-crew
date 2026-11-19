import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Compass, LogOut, Menu, Plus, X } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import Avatar from "../common/Avatar";
import Button from "../common/Button";

const linkClass = ({ isActive }) =>
  `rounded-full px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-peach text-ink" : "text-ink/70 hover:text-ink"
  }`;

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  const links = user
    ? [
        { to: "/explore", label: "Explore" },
        { to: "/dashboard", label: "Dashboard" },
        { to: "/my-activities", label: "My Activities" },
      ]
    : [{ to: "/explore", label: "Explore" }];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-surface/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4" aria-label="Main">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 text-lg font-extrabold">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-white">
            <Compass size={18} />
          </span>
          Find My Crew
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!loading &&
            (user ? (
              <>
                <Button to="/create-activity">
                  <Plus size={16} /> Create
                </Button>
                <Link to={`/profile/${user._id}`} aria-label="Your profile">
                  <Avatar user={user} size="sm" />
                </Link>
                <button
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="rounded-full p-2 text-ink/60 transition hover:bg-peach hover:text-ink"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Button to="/login" variant="outline">
                  Log in
                </Button>
                <Button to="/register">Sign up</Button>
              </>
            ))}
        </div>

        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="rounded-full p-2 md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="flex flex-col gap-1 border-t border-gray-100 bg-surface px-4 pb-4 pt-2 md:hidden">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} onClick={closeMenu} className={linkClass}>
              {label}
            </NavLink>
          ))}
          {!loading &&
            (user ? (
              <>
                <NavLink to="/create-activity" onClick={closeMenu} className={linkClass}>
                  Create Activity
                </NavLink>
                <NavLink to={`/profile/${user._id}`} onClick={closeMenu} className={linkClass}>
                  Profile
                </NavLink>
                <button onClick={handleLogout} className="rounded-full px-3 py-2 text-left text-sm font-semibold text-ink/70">
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={closeMenu} className={linkClass}>
                  Log in
                </NavLink>
                <NavLink to="/register" onClick={closeMenu} className={linkClass}>
                  Sign up
                </NavLink>
              </>
            ))}
        </div>
      )}
    </header>
  );
}