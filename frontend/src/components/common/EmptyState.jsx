export default function EmptyState({ icon: Icon, title, message, children }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 rounded-3xl bg-white px-6 py-12 text-center shadow-sm">
      {Icon && (
        <span className="grid h-14 w-14 place-items-center rounded-full bg-peach text-primary">
          <Icon size={26} />
        </span>
      )}
      <h3 className="text-lg font-bold">{title}</h3>
      {message && <p className="text-sm text-ink/70">{message}</p>}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}