import { connection } from "next/server";
import Link from "next/link";
import { getAdminHotels } from "@/lib/dal/admin-hotels";
import HotelStatusActions from "@/components/admin/hotels/hotel-status-actions";

export const instant = false;

function getStatusClasses(status: string) {
  switch (status) {
    case "published":
      return "bg-green-50 text-green-700 ring-green-600/20";
    case "archived":
      return "bg-gray-100 text-gray-600 ring-gray-500/20";
    default:
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
  }).format(date);
}

export default async function AdminHotelsPage() {
  await connection();

  const hotels = await getAdminHotels();

  const publishedCount = hotels.filter(
    (hotel) => hotel.status === "published",
  ).length;

  const draftCount = hotels.filter((hotel) => hotel.status === "draft").length;

  const archivedCount = hotels.filter(
    (hotel) => hotel.status === "archived",
  ).length;

  return (
    <section className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#425B9A]">Hotel management</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">Hotels</h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Manage hotel details, publication status, and availability across
            the Stayora platform.
          </p>
        </div>

        <Link
          href="/admin/hotels/new"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#425B9A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#35497D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#425B9A]"
        >
          <span aria-hidden="true" className="mr-2 text-lg">
            +
          </span>
          Add hotel
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total hotels</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">
            {hotels.length}
          </p>
          <p className="mt-1 text-xs text-gray-500">All registered hotels</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Published</p>
          <p className="mt-2 text-3xl font-bold text-green-700 tabular-nums">
            {publishedCount}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Available on the public site
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="mt-2 text-3xl font-bold text-amber-700 tabular-nums">
            {draftCount}
          </p>
          <p className="mt-1 text-xs text-gray-500">Not yet published</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Archived</p>
          <p className="mt-2 text-3xl font-bold text-gray-600 tabular-nums">
            {archivedCount}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            No longer actively listed
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-1 border-b border-gray-200 px-5 py-5 sm:px-6">
          <h2 className="font-semibold">All hotels</h2>
          <p className="text-sm text-gray-500">
            Review each hotel&apos;s location and current status.
          </p>
        </div>

        {hotels.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#425B9A]/10 text-2xl text-[#425B9A]">
              +
            </div>

            <h3 className="mt-4 text-lg font-semibold">No hotels yet</h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              Add your first hotel to start building the Stayora booking
              catalog.
            </p>

            <Link
              href="/admin/hotels/new"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#425B9A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#35497D]"
            >
              Add your first hotel
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/80 text-gray-500">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">
                    Hotel
                  </th>
                  <th scope="col" className="px-6 py-4 font-medium">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-4 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 font-medium">
                    Date added
                  </th>
                  <th scope="col" className="px-6 py-4 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {hotels.map((hotel) => (
                  <tr
                    key={hotel.id}
                    className="transition-colors hover:bg-gray-50/80"
                  >
                    <td className="px-6 py-5">
                      <p className="font-semibold text-[#26334D]">
                        {hotel.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        /{hotel.slug}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-gray-600">
                      <p>{hotel.city}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {hotel.country}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ring-1 ring-inset ${getStatusClasses(hotel.status)}`}
                      >
                        <span
                          aria-hidden="true"
                          className="mr-2 size-1.5 rounded-full bg-current"
                        />
                        {hotel.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-5 text-gray-600">
                      {formatDate(hotel.createdAt)}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/hotels/${hotel.id}/edit`}
                          className="font-semibold text-[#425B9A] hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#425B9A]"
                        >
                          Edit
                        </Link>

                        <HotelStatusActions
                          hotelId={hotel.id}
                          status={hotel.status}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Showing {hotels.length} {hotels.length === 1 ? "hotel" : "hotels"}
      </p>
    </section>
  );
}
