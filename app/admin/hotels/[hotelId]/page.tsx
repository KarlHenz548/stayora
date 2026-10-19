
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { hotels } from "@/lib/db/schema";
import { getHotelRoomTypes } from "@/lib/dal/admin-room-management";

export const instant = false;

export default async function HotelRoomManagementPage({
  params,
}: {
  params: Promise<{ hotelId: string }>;
}) {
  await connection();

  const { hotelId } = await params;

  const [hotel] = await db
    .select({
      id: hotels.id,
      name: hotels.name,
      city: hotels.city,
      country: hotels.country,
    })
    .from(hotels)
    .where(eq(hotels.id, hotelId))
    .limit(1);

  if (!hotel) notFound();

  const roomTypes = await getHotelRoomTypes(hotelId);

  return (
    <section>
      <Link
        href="/admin/rooms"
        className="text-sm font-medium text-[#425B9A] hover:underline"
      >
        ← Back to Room Management
      </Link>

      <div className="mt-6">
        <p className="text-sm font-medium text-[#425B9A]">
          Room Management
        </p>
        <h1 className="mt-2 text-2xl font-bold">{hotel.name}</h1>
        <p className="mt-2 text-sm text-gray-500">
          {hotel.city}, {hotel.country}
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Room Types</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage the types of rooms offered by this hotel.
            </p>
          </div>
        </div>

        {roomTypes.length === 0 ? (
          <div className="py-12 text-center">
            <h3 className="font-semibold">No room types yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create your first room type to get started.
            </p>
          </div>
        ) : (
          <div className="mt-6 divide-y divide-gray-100">
            {roomTypes.map((roomType) => (
              <article key={roomType.id} className="py-5 first:pt-0">
                <h3 className="font-semibold">{roomType.name}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {roomType.description}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Capacity: {roomType.capacity} · Beds:{" "}
                  {roomType.bedConfiguration}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
