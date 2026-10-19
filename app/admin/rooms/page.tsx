import Link from "next/link";
import { getHotelsForRoomManagement } from "@/lib/dal/admin-room-management";
import { connection } from "next/server";

export const instant = false;

export default async function AdminRoomsPage() {
  await connection();

  const hotels = await getHotelsForRoomManagement();

  return (
    <section>
      <div>
        <p className="text-sm font-medium text-[#425B9A]">
          Inventory management
        </p>
        <h1 className="mt-2 text-2xl font-bold">Room Management</h1>
        <p className="mt-2 text-sm text-gray-500">
          Choose a hotel to manage its room types and rooms.
        </p>
      </div>

      {hotels.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-lg font-semibold">No hotels available</h2>
          <p className="mt-2 text-sm text-gray-500">
            Create a hotel before adding room types.
          </p>
          <Link
            href="/admin/hotels/new"
            className="mt-5 inline-flex rounded-xl bg-[#425B9A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#35497D]"
          >
            Add hotel
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {hotels.map((hotel) => (
            <article
              key={hotel.id}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-[#26334D]">{hotel.name}</h2>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                  {hotel.status}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                {hotel.city}, {hotel.country}
              </p>

              <p className="mt-5 text-sm text-gray-500">
                Manage room types, rooms, and rates for this hotel.
              </p>

              <Link
                href={`/admin/rooms/${hotel.id}`}
                className="mt-5 inline-flex rounded-xl bg-[#425B9A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#35497D]"
              >
                Manage rooms
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
