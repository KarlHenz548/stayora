export default function BookingsLoading() {
  return (
    <main
      className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 sm:px-10"
      aria-busy="true"
      aria-label="Loading your bookings"
    >
      <div className="animate-pulse">
        <div className="h-4 w-32 rounded bg-gray-200" />
        <div className="mt-4 h-9 w-56 rounded bg-gray-200" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-gray-200" />

        <div className="mt-8 space-y-5">
          {[1, 2, 3].map((item) => (
            <article
              key={item}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[8px_8px_20px_rgba(66,91,154,0.08)] sm:p-8"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div className="space-y-3">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="h-5 w-48 max-w-full rounded bg-gray-200" />
                  <div className="h-4 w-40 rounded bg-gray-200" />
                </div>

                <div className="flex gap-2">
                  <div className="h-7 w-24 rounded-full bg-gray-200" />
                  <div className="h-7 w-28 rounded-full bg-gray-200" />
                </div>
              </div>

              <div className="my-6 grid gap-4 rounded-2xl bg-[#F8FAFF] p-5 sm:grid-cols-3">
                {[1, 2, 3].map((detail) => (
                  <div key={detail} className="space-y-2">
                    <div className="h-4 w-20 rounded bg-gray-200" />
                    <div className="h-5 w-32 max-w-full rounded bg-gray-200" />
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="h-5 w-36 rounded bg-gray-200" />
                <div className="h-16 rounded-xl border border-gray-100 bg-gray-50" />
                <div className="h-4 w-36 rounded bg-gray-200" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}