import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FormField from "../components/common/FormField";
import useAuth from "../hooks/useAuth";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/dashboard";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  if (user) return <Navigate to={redirectTo} replace />;

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success("Welcome back!");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm flex flex-col gap-5"
      >
        <div>
          <h1 className="text-2xl font-extrabold">Welcome back</h1>
          <p className="text-sm text-gray-500">Log in to find your crew.</p>
        </div>

        <FormField
          label="Email"
          id="email"
          type="email"
          error={errors.email}
          registration={register("email", { required: "Email is required" })}
        />
        <FormField
          label="Password"
          id="password"
          type="password"
          error={errors.password}
          registration={register("password", { required: "Password is required" })}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-primary py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>

        <p className="text-center text-sm">
          New here?{" "}
          <Link to="/register" className="font-semibold text-primary">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}