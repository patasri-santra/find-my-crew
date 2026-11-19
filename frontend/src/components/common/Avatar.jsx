const sizes = {
  sm: "h-9 w-9 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-24 w-24 text-3xl",
};

export default function Avatar({ user, size = "md" }) {
  const name = user?.name || "?";

  if (user?.profileImage) {
    return <img src={user.profileImage} alt={name} className={`${sizes[size]} shrink-0 rounded-full object-cover`} />;
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={`${sizes[size]} grid shrink-0 place-items-center rounded-full bg-peach font-bold text-ink`}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}