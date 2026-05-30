
type SortIndicatorProps = {
  active: boolean;
  order: "asc" | "desc";
};

export default function SortIndicator({
  active,
  order,
}: SortIndicatorProps) {
  if (!active) return null;

  return (
    <span className="inline-flex items-center justify-center w-4 h-4 -ml-1.5">
      {order === "asc" ? (
        <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
          <path d="M10 6l-5 5h10l-5-5z" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
          <path d="M10 14l5-5H5l5 5z" />
        </svg>
      )}
    </span>
  );
}