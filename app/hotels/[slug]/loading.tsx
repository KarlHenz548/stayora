export default function HotelDetailsLoading() {
  return (
    <main
      className="min-h-screen bg-[#FFF6DC] px-5 py-8 sm:px-10 lg:px-16"
      aria-busy="true"
      aria-label="Loading hotel details"
    >
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-5 w-32 rounded bg-gray-200" />

        <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="h-64 w-full bg-gray-200 sm:h-96" />

          <div className="space-y-4 p-6 sm:p-10">
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="h-9 w-3/4 max-w-md rounded bg-gray-200" />
            <div className="h-4 w-full max-w-3xl rounded bg-gray-200" />
            <div className="h-4 w-2/3 max-w-2xl rounded bg-gray-200" />
          </div>
        </section>

        <section className="mt-10">
          <div className="h-8 w-56 rounded bg-gray-200" />

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="h-6 w-40 rounded bg-gray-200" />
                <div className="mt-4 h-4 w-full rounded bg-gray-200" />
                <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />
                <div className="mt-5 h-10 w-full rounded-xl bg-gray-200" />
                <div className="mt-3 h-10 w-full rounded-xl bg-gray-200" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
