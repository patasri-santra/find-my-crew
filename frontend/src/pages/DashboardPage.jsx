import useAuth from "../hooks/useAuth";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-extrabold">Welcome, {user.name}!</h1>
      <button onClick={logout} className="rounded-full bg-primary px-6 py-2 font-semibold text-white">
        Logout
      </button>
    </div>
  );
}