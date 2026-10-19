export default function Loading() {
  return (
    <main
      className="min-h-screen bg-[#FFF6DC] px-5 py-12 sm:px-10 lg:px-16"
      aria-busy="true"
      aria-label="Loading hotels"
    >
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-4 w-28 rounded bg-[#425B9A]/20" />

        <div className="mt-10 h-10 max-w-md rounded-lg bg-[#425B9A]/20" />

        <div className="mt-4 h-5 max-w-xl rounded bg-[#425B9A]/10" />

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="h-48 rounded-xl bg-[#425B9A]/10" />
              <div className="mt-4 h-5 w-3/4 rounded bg-[#425B9A]/15" />
              <div className="mt-3 h-4 w-1/2 rounded bg-[#425B9A]/10" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
