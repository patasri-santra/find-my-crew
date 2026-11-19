export default function ActivityCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl bg-white shadow-sm" aria-hidden="true">
      <div className="aspect-[16/10] bg-peach/60" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 rounded bg-gray-100" />
        <div className="h-4 w-1/2 rounded bg-gray-100" />
        <div className="h-4 w-2/3 rounded bg-gray-100" />
      </div>
    </div>
  );
}