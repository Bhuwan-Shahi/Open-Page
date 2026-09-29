export default function LoadingSpinner({ size = "medium", text = "Loading..." }) {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8" role="status">
      <div className={`animate-spin rounded-full border-2 border-line border-b-amber ${sizeClasses[size]}`}></div>
      {text && <p className="mt-3 text-sm text-muted">{text}</p>}
    </div>
  );
}
