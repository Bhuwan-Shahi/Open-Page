export default function InteractiveButton({ href, children, variant = "primary", className = "", size = "default", ...props }) {
  const variantCls = {
    primary: "bg-amber text-white hover:bg-amber-soft",
    secondary: "bg-ink text-paper hover:bg-night",
  }[variant] || "bg-amber text-white hover:bg-amber-soft";

  const sizeCls = {
    sm: "px-4 py-2 text-sm",
    large: "px-10 py-4 text-lg",
  }[size] || "px-8 py-3 text-base";

  return (
    <Link
      href={href}
      className={`inline-block rounded-lg font-semibold transition-colors ${variantCls} ${sizeCls} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
