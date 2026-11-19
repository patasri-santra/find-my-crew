export default function FormField({
  label,
  id,
  as: Component = "input",
  type = "text",
  error,
  hint,
  registration,
  children,
  ...rest
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <Component
        id={id}
        {...(Component === "input" ? { type } : {})}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
        className={`rounded-xl border bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-primary/40 ${
          error ? "border-red-400" : "border-gray-200"
        }`}
        {...registration}
        {...rest}
      >
        {children}
      </Component>
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-ink/60">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-500">
          {error.message}
        </p>
      )}
    </div>
  );
}