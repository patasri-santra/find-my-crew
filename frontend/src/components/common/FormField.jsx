export default function FormField({ label, id, type = "text", error, registration, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        aria-invalid={error ? "true" : "false"}
        className={`rounded-xl border bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-primary/40 ${
          error ? "border-red-400" : "border-gray-200"
        }`}
        {...registration}
      />
      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error.message}
        </p>
      )}
    </div>
  );
}