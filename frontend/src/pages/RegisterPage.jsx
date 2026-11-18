import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FormField from "../components/common/FormField";
import useAuth from "../hooks/useAuth";

export default function RegisterPage() {
  const { user, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success("Welcome to Find My Crew!");
      navigate("/dashboard");
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
          <h1 className="text-2xl font-extrabold">Create your account</h1>
          <p className="text-sm text-gray-500">Find your people. Share your moments.</p>
        </div>

        <FormField
          label="Full name"
          id="name"
          error={errors.name}
          registration={register("name", {
            required: "Name is required",
            minLength: { value: 2, message: "At least 2 characters" },
          })}
        />
        <FormField
          label="Email"
          id="email"
          type="email"
          error={errors.email}
          registration={register("email", {
            required: "Email is required",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
          })}
        />
        <FormField
          label="Password"
          id="password"
          type="password"
          error={errors.password}
          registration={register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "At least 8 characters" },
            validate: (v) => (/[A-Za-z]/.test(v) && /\d/.test(v)) || "Include a letter and a number",
          })}
        />
        <FormField
          label="Confirm password"
          id="confirmPassword"
          type="password"
          error={errors.confirmPassword}
          registration={register("confirmPassword", {
            required: "Please confirm your password",
            validate: (v) => v === watch("password") || "Passwords do not match",
          })}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-primary py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Register"}
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}