export default function BookingDetailsLoading() {
  return (
    <main
      className="min-h-screen bg-[#FFF6DC] px-5 py-10 sm:px-10"
      aria-busy="true"
      aria-label="Loading booking details"
    >
      <div className="mx-auto max-w-3xl animate-pulse">
        <div className="h-4 w-40 rounded bg-gray-200" />

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="w-full space-y-3 sm:w-2/3">
              <div className="h-4 w-36 rounded bg-gray-200" />
              <div className="h-9 w-full max-w-xs rounded bg-gray-200" />
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-4 w-full max-w-sm rounded bg-gray-200" />
            </div>

            <div className="h-9 w-28 rounded-full bg-gray-200" />
          </div>

          <section className="mt-8 border-t border-gray-100 pt-6">
            <div className="h-6 w-48 rounded bg-gray-200" />

            <div className="mt-4 space-y-4">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-gray-100 p-5"
                >
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="mt-3 h-6 w-48 max-w-full rounded bg-gray-200" />

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="h-20 rounded-xl bg-[#FFF6DC]" />
                    <div className="h-20 rounded-xl bg-[#FFF6DC]" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 border-t border-gray-100 pt-6">
            <div className="h-6 w-36 rounded bg-gray-200" />

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="space-y-2">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                  <div className="h-5 w-36 max-w-full rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 border-t border-gray-100 pt-6">
            <div className="h-6 w-40 rounded bg-gray-200" />
            <div className="mt-4 h-24 rounded-2xl bg-[#FFF6DC]" />
            <div className="mt-4 h-20 rounded-2xl bg-[#FFF6DC]" />
          </section>

          <section className="mt-8 border-t border-gray-100 pt-6">
            <div className="h-6 w-40 rounded bg-gray-200" />

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="h-12 rounded bg-gray-100" />
              <div className="h-12 rounded bg-gray-100" />
            </div>
          </section>

          <div className="mt-8 flex flex-wrap gap-4">
            <div className="h-11 w-44 rounded-xl bg-gray-200" />
            <div className="h-11 w-36 rounded-xl bg-gray-200" />
          </div>
        </section>
      </div>
    </main>
  );
}
