type HotelListProps = {
  children: React.ReactNode;
  hasHotels: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
};

export default function HotelList({
  children,
  hasHotels,
  emptyTitle = "No hotels found",
  emptyMessage = "Try searching for a different destination.",
}: HotelListProps) {
  return hasHotels ? (
    <div className="grid grid-cols-1 gap-6 min-[1100px]:grid-cols-2 min-[1500px]:grid-cols-3">
      {children}
    </div>
  ) : (
    <div
      role="status"
      className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm"
    >
      <h2 className="text-xl font-semibold text-slate-900">{emptyTitle}</h2>
      <p className="mt-2 text-slate-600">{emptyMessage}</p>
    </div>
  );
}
