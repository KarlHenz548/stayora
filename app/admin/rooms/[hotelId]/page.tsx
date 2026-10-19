import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { hotels } from "@/lib/db/schema";
import {
  getHotelRoomRates,
  getHotelRoomTypes,
  getHotelRooms,
} from "@/lib/dal/admin-room-management";
import RoomManagementTable from "@/components/admin/rooms/room-management-table";

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

  const [roomTypes, rooms, roomRates] = await Promise.all([
    getHotelRoomTypes(hotelId),
    getHotelRooms(hotelId),
    getHotelRoomRates(hotelId),
  ]);

  return (
    <section>
      <Link
        href="/admin/rooms"
        className="text-sm font-medium text-[#425B9A] hover:underline"
      >
        ← Back to Room Management
      </Link>

      <div className="mt-6">
        <p className="text-sm font-medium text-[#425B9A]">Room Management</p>
        <h1 className="mt-2 text-2xl font-bold">{hotel.name}</h1>
        <p className="mt-2 text-sm text-gray-500">
          {hotel.city}, {hotel.country}
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">All Room Records</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage room types, room rates, and individual rooms in one place.
          </p>
        </div>

        <RoomManagementTable
          hotelId={hotel.id}
          roomTypes={roomTypes}
          rooms={rooms}
          roomRates={roomRates}
        />
      </div>
    </section>
  );
}
