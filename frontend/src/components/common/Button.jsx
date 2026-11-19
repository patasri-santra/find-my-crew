import { Link } from "react-router-dom";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary: "bg-primary text-white hover:bg-primary/90",
  secondary: "bg-peach text-ink hover:bg-peach/70",
  outline: "border border-gray-200 bg-white text-ink hover:border-primary",
};

const sizes = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

// Renders a router <Link> when `to` is given, otherwise a <button>
export default function Button({ to, variant = "primary", size = "md", className = "", children, ...props }) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}